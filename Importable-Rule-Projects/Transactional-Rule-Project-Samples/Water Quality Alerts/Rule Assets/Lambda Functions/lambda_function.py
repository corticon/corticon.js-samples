import json
import urllib3
import datetime
import urllib.parse
import urllib.request  # Import the urllib.request module

def lambda_handler(event, context):
    """
    Retrieves data from an ERDDAP endpoint, reformats it to a list of dictionaries,
    and returns the result as a JSON string. This version uses urllib.request and handles json format.
    This version requests data for the last 7 days.
    """

    # Set the number of days
    num_days = 7

    # Calculate the start and end times
    now = datetime.datetime.utcnow()
    past_days = now - datetime.timedelta(days=num_days)
    time_start = past_days.isoformat() + "Z"
    time_end = now.isoformat() + "Z"

    # Construct the ERDDAP URL
    all_fields = "time%2Cz%2Cmass_concentration_of_chlorophyll_in_sea_water%2Cmass_concentration_of_chlorophyll_in_sea_water_qc_agg%2Csea_water_electrical_conductivity%2Csea_water_electrical_conductivity_qc_agg%2Cdepth_reading%2Cdepth_reading_qc_agg%2Cfluorescent_dissolved_organic_matter%2Cfluorescent_dissolved_organic_matter_qc_agg%2Cmass_concentration_of_oxygen_in_sea_water%2Cmass_concentration_of_oxygen_in_sea_water_qc_agg%2Cfractional_saturation_of_oxygen_in_sea_water%2Cfractional_saturation_of_oxygen_in_sea_water_qc_agg%2Cphycoerythrin%2Cphycoerythrin_qc_agg%2Csea_water_practical_salinity%2Csea_water_practical_salinity_qc_agg%2Cspecific_conductance%2Cspecific_conductance_qc_agg%2Csea_water_temperature%2Csea_water_temperature_qc_agg%2Csea_water_turbidity%2Csea_water_turbidity_qc_agg%2Csea_water_ph_reported_on_total_scale%2Csea_water_ph_reported_on_total_scale_qc_agg"
    base_erddap_url = f"https://erddap.secoora.org/erddap/tabledap/sanibel-dock.json?{all_fields}"  # Changed to .json

    time_filter = f"&time%3E={urllib.parse.quote_plus(time_start)}&time%3C={urllib.parse.quote_plus(time_end)}"
    full_erddap_url = base_erddap_url + time_filter

    print("Full ERDDAP URL:", full_erddap_url)  # Used for debugging

    try:
        # Retrieve data from the ERDDAP endpoint
        with urllib.request.urlopen(full_erddap_url) as response:
            erddap_data = json.loads(response.read().decode('utf-8'))

         # Extract headers and rows using the known ERDDAP structure
        headers = erddap_data['table']['columnNames']
        rows = erddap_data['table']['rows']

        #Transform the data from erddap
        transformed_data = transform_erddap_data(headers, rows)


    except urllib.error.URLError as e:
        print(f"Error retrieving data from ERDDAP: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Could not connect to ERDDAP: {str(e)}"})
        }
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Could not decode ERDDAP Response as JSON. {str(e)} Response may not be in JSON format."})
        }
    except KeyError as e:
         return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Error: Incorrect JSON format returned from ERDDAP, missing field: {str(e)}"})
        }
    except Exception as e:
        print(f"Error fetching data from ERDDAP: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


    # Invoke the Corticon Lambda Function using Function URL
    corticon_function_url = "https://...../"  # Replace with the Function URL of your Corticon Lambda

    corticon_headers = {'Content-Type': 'application/json'}

    try:
        http = urllib3.PoolManager()
        corticon_response = http.request(
            'POST',
            corticon_function_url,
            body=f"[{json.dumps(transformed_data)}]",  # Encode the data as JSON
            headers=corticon_headers
        )

        corticon_response_data = json.loads(corticon_response.data.decode('utf-8'))

        # Extract key information for report
        report_string = format_report(corticon_response_data)

        print(report_string)  # Log the formatted output

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Data sent to Corticon and processed successfully', 'report': report_string})  # Include the formatted report in the response
        }

    except Exception as e:
        print(f"Error invoking Corticon Lambda: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def transform_erddap_data(headers, rows):
    """
    Transforms the ERDDAP data into a list of dictionaries.

    Args:
        headers (list): A list of strings representing the column names (headers).
        rows (list): A list of lists, where each inner list represents a row of data.

    Returns:
        A list of dictionaries, where each dictionary represents a data point.
    """
    transformed_list = []
    for row in rows:
        if len(row) != len(headers):
            print(f"Warning: Skipping row due to incorrect number of columns: {row}")
            continue

        data_point = {}
        for i, header in enumerate(headers):
            data_point[header] = row[i]
        transformed_list.append(data_point)

    return transformed_list

def format_report(corticon_response):
    """
    Formats the Corticon response into a human-readable string, handling both alert and noAlerts cases.

    Args:
        corticon_response: The JSON response from the Corticon Lambda function.

    Returns:
        A string containing the formatted water quality report.
    """
    report = "Water Quality Report:\n"

    # Check for the "noAlerts" property
    if 'reading' not in corticon_response:
        report += "  No alerts triggered.\n"
        return report

    readings = corticon_response['reading']  # Access the 'reading' key from corticon_response

    # Format report for each reading that trigger a rule in the corticon
    for reading in readings:
        time = reading.get('time', 'Unknown Time')
        report += f"  Time: {time}\n"

        alert = reading.get('alert')  # Access the 'alert' object
        if alert:
            report += "  Alert:\n"
            report += f"    Category: {alert.get('category', 'Unknown Category')}\n"
            report += f"    Summary: {alert.get('summary', 'Unknown Summary')}\n"
            report += f"    Description: {alert.get('description', 'No Description')}\n"
        else:
            report += "  No alert triggered.\n"

    return report