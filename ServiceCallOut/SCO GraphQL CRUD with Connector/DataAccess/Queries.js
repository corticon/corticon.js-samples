/*
This module defines the queries available to modelers: see module.exports at bottom of the file.
Each query is defined as an object literal where all variables have been resolved. In other words,
the query can be executed as is on the GraphQL server without additional changes. 
*/

// Query to retrieve all patients and add results to the root of the payload.
// This query does not take any parameters as we simply retrieve everything from the DB.
function getAllPatientsMetadata(params) {
	const allPatients = {
			  query: `query getAllPatients{
				allPatients {
					nodes {
						patientid
						patientname
						dob
						gender
						region
					}
				}
			}`
	    };

    return { "query": allPatients, 	// The GraphQL query with all the parameters resolved.
        "pathToData": 'allPatients',  // The name of the attribute where to find the list of patients
        "pathToData2": 'nodes', // The name of the attribute where to find patients array under pathToData - this is our JSON sub-payload in the GraphQL results.
        'entityType': 'Patient',  // The Corticon vocabulary datatype of the entity we will be adding sub-payload to the root of the payload (only used when adding to root)
        'roleName': ''	// The Corticon vocabulary external name of the relationship to which we will be adding the sub-payload (only used when adding to a specific entity) - in our case the role name is "countriesOfInterest" but the external name is "countries" - see the properties of the relationship in vocab.ecore
    };
}

// Query to create an additional patient in the DB.
// The modeler needs to specify the id of the entity.  This is used to retrieve the patient data 
// from a specific in-memory entity in this sample.  This is one design choice in how the service is modeled.
// The data for the new entity could be coming from other locations. 
// The key thing is that this function can be used in any scenario as it takes the data for the new patient
// as an object literal.
function createPatientMetadata(newEntityAsJson) {
	const query = {
			  query: `mutation { createPatient(input: {patient: ${newEntityAsJson}}){patient {patientid}}}`
	    };

    return { "query": query };	// The GraphQL query with all the parameters resolved.    
}

// A query to update a patient.  It takes two parameters: the first one is the id of the patient to update
// the second one is the patient object literal to send to the DB.  This is similar to the create case
// where the function is generic and does not care where the data is obtained from. 
function updatePatientMetadata(params) {
	const patientToUpdateId = params[0];
	const updatedEntityAsJson = params[1];
	const query = {
			  query: `mutation { updatePatientByPatientid(input: { patientid: \"${patientToUpdateId}\", patientPatch: ${updatedEntityAsJson} }) {patient {patientid}}}`
	    };

    return { "query": query };	// The GraphQL query with all the parameters resolved.
}

// A query to remove a patient by patient ID from the DB.
// The modeler needs to specify just one parameter: the patient id.
function deletePatientByIdMetadata(params) {
	const query = {
			  query: `mutation { deletePatientByPatientid (input: { patientid: \"${params[0]}\" }) 
			  {deletedPatientId}}`
	    };

    return { "query": query };	// The GraphQL query with all the parameters resolved.
}

// All exported names are available as queries to the modeler.  It's best to define them as an emum (Custom data type) 
// in Corticon vocabulary and define the name attribute of the Query entity to be of the Custom data type instead of
// just plain String.  Note that the name can contain spaces to make it even more modeler friendly.
module.exports= { "Get All Patients": getAllPatientsMetadata, 
				  "Create Patient": createPatientMetadata, 
				  "Update Patient": updatePatientMetadata, 
				  "Delete Patient": deletePatientByIdMetadata 
				};
