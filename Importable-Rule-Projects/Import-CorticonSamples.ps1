#Requires -Modules Microsoft.PowerShell.Management,Microsoft.PowerShell.Utility
<#
.SYNOPSIS
    Automates the process of downloading Corticon.js rule project samples from GitHub
    and setting them up for use in Corticon.js Studio.

.DESCRIPTION
    This script performs the following actions:
    1. Clones the official Corticon.js samples GitHub repository to a local directory.
    2. Scans the repository for all sample projects (identified by 'Rule Project.zip').
    3. For each sample, it creates a corresponding folder in the Corticon Studio 'Samples' directory.
    4. It copies the rule project and renames it according to its parent folder's name.
    5. It dynamically generates the required 'metadata.xml' and 'metadata.properties' files.
    6. It attempts to use the content of any 'README.md' file for the sample's long description.
    7. It categorizes the sample based on its parent directory in the source repository.
#>

# --- START: User Configuration ---

# Set the version of Corticon.js installed. This is used to build the path.
$CorticonVersion = "2.3"

# Set the base directory for Progress products.
$ProgressBaseDirectory = "C:\Progress"

# --- END: User Configuration ---


# --- Script Body (No edits needed below this line) ---

# Construct the destination path for Corticon samples
$CorticonSamplesDirectory = Join-Path -Path $ProgressBaseDirectory -ChildPath "Corticon.js $CorticonVersion\Samples"

# Construct the path for the temporary repository clone
$RepoCloneDirectory = Join-Path -Path $env:TEMP -ChildPath "corticon-js-samples-repo"

# GitHub repository URL
$RepoUrl = "https://github.com/corticon/corticon.js-samples.git"

# --- Main Logic ---

# Function to write a message to the console
function Write-Log {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "[$([datetime]::Now.ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

# 1. Check if Git is installed
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
    Write-Log "ERROR: Git is not installed or not found in your system's PATH. Please install Git to continue." -Color Red
    exit 1
}

# 2. Check if the Corticon Samples directory exists
if (-not (Test-Path -Path $CorticonSamplesDirectory)) {
    Write-Log "ERROR: Corticon samples directory not found at '$CorticonSamplesDirectory'." -Color Red
    Write-Log "Please verify your Corticon.js installation and the version specified in this script." -Color Yellow
    exit 1
}

Write-Log "Target Corticon Samples Directory: $CorticonSamplesDirectory" -Color Cyan

# 3. Clone or update the repository
if (Test-Path -Path $RepoCloneDirectory) {
    Write-Log "Repository already exists. Skipping clone."
}
else {
    Write-Log "Cloning sample repository from GitHub..." -Color Green
    git clone $RepoUrl $RepoCloneDirectory
    if ($LASTEXITCODE -ne 0) {
        Write-Log "ERROR: Failed to clone the GitHub repository." -Color Red
        exit 1
    }
}

# 4. Find all 'Rule Project.zip' files
Write-Log "Scanning for rule projects in '$RepoCloneDirectory'..."
$ruleProjects = Get-ChildItem -Path $RepoCloneDirectory -Recurse -Filter "Rule Project.zip"

if (-not $ruleProjects) {
    Write-Log "No rule projects named 'Rule Project.zip' were found in the repository." -Color Yellow
    exit 0
}

Write-Log "Found $($ruleProjects.Count) rule projects. Processing now..." -Color Green
$processedCount = 0

# 5. Process each found project
foreach ($project in $ruleProjects) {
    $sampleName = $project.Directory.Name
    Write-Log "Processing: '$sampleName'..."

    $destinationPath = Join-Path -Path $CorticonSamplesDirectory -ChildPath $sampleName
    $sourceReadmePath = Join-Path -Path $project.Directory.FullName -ChildPath "README.md"

    # ### MODIFICATION: Get the parent directory's name to use as the topic ###
    $topicName = (Split-Path -Path $project.Directory.FullName -Parent | Split-Path -Leaf)

    # Create the destination directory for the sample
    if (-not (Test-Path -Path $destinationPath)) {
        New-Item -ItemType Directory -Path $destinationPath | Out-Null
    }

    # Copy and rename the zip file
    $newZipName = "$sampleName.zip"
    Copy-Item -Path $project.FullName -Destination (Join-Path -Path $destinationPath -ChildPath $newZipName) -Force

    # Generate metadata.properties content
    $shortDescription = $sampleName
    if (Test-Path -Path $sourceReadmePath) {
        # Use README content if it exists
        $longDescription = Get-Content -Path $sourceReadmePath -Raw
    }
    else {
        # Use a generic description if no README
        $longDescription = "This sample has been developed from the business requirement of '$sampleName'."
    }
    $propertiesContent = "shortDescription = $shortDescription`r`nlongDescription = $longDescription"
    Set-Content -Path (Join-Path -Path $destinationPath -ChildPath "metadata.properties") -Value $propertiesContent

    # Generate metadata.xml content
    $xmlContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<IUE id="CorticonSample_$($sampleName.Replace(' ',''))" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://www.jaxb.iue.branding.tools.progress.com">
	<name>$sampleName</name>
	<category>sample</category>	
	<publicationDate>$(Get-Date -Format 'yyyy-MM-dd')</publicationDate>
	<shortDescription>%shortDescription</shortDescription>
	<description>%longDescription</description>
	<size>65536</size>
	<metadata>
		<contributionType id="com.progress.tools.branding.iue.type.sample">
			<properties key="samplePath">
				<simpleValue>$newZipName</simpleValue>
			</properties>
			<properties key="perspectiveID">
				<simpleValue>com.corticon.eclipse.studio.ui.perspectives.RuleDevelopmentPerspectiveID</simpleValue>
			</properties>			
		</contributionType>
		<filters>
			<topic>$topicName</topic> <complexity>Getting Started</complexity>
			<productsSupported>
				<product version="[0.0.0, 9.0.0]" id="com.corticon.eclipse.studio.product">
				<capability>Corticon</capability>
				</product>
			</productsSupported>
		</filters>
	</metadata>		
</IUE>
"@
    Set-Content -Path (Join-Path -Path $destinationPath -ChildPath "metadata.xml") -Value $xmlContent
    $processedCount++
}

Write-Log "--------------------------------------------------" -Color Green
Write-Log "Automation Complete!" -Color Green
Write-Log "Successfully processed and installed $processedCount samples."
Write-Log "Please restart Corticon.js Studio and navigate to Help -> Samples to see the new projects."