#Requires -Modules Microsoft.PowerShell.Management,Microsoft.PowerShell.Utility
<#
.SYNOPSIS
    Automates the process of downloading Corticon.js rule project samples from GitHub
    and setting them up for use in Corticon.js Studio.
.DESCRIPTION
    This script performs the following actions:
    1. Clones the official Corticon.js samples GitHub repository if not present.
    2. If the repository is present, it pulls the latest updates.
    3. Scans the repository for all sample projects (identified by 'Rule Project.zip').
    4. Creates corresponding folders and metadata for each sample.
    5. It categorizes the sample based on its parent directory in the source repository.
#>

# --- START: User Configuration ---

# Set the version of Corticon.js installed. This is used to build the path.
$CorticonVersion = "2.3"

# Set the base directory for Progress products.
$ProgressBaseDirectory = "C:\Progress"

# --- END: User Configuration ---


# --- Script Body (No edits needed below this line) ---

$CorticonSamplesDirectory = Join-Path -Path $ProgressBaseDirectory -ChildPath "Corticon.js $CorticonVersion\Samples"
$RepoCloneDirectory = Join-Path -Path $env:TEMP -ChildPath "corticon-js-samples-repo"
$RepoUrl = "https://github.com/corticon/corticon.js-samples.git"

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

# --- MODIFIED LOGIC TO CLONE OR PULL UPDATES ---
# 3. Clone the repository if it doesn't exist, or pull updates if it does.
if (Test-Path -Path $RepoCloneDirectory) {
    Write-Log "Local repository found. Fetching latest updates from GitHub..." -Color Green
    try {
        # Temporarily change location to the repo to run 'git pull'
        Push-Location -Path $RepoCloneDirectory
        git pull
        Pop-Location # Return to the previous location
    }
    catch {
        Write-Log "ERROR: Failed to pull updates from the GitHub repository." -Color Red
        exit 1
    }
}
else {
    Write-Log "Cloning sample repository from GitHub for the first time..." -Color Green
    git clone $RepoUrl $RepoCloneDirectory
    if ($LASTEXITCODE -ne 0) {
        Write-Log "ERROR: Failed to clone the GitHub repository." -Color Red
        exit 1
    }
}
# --- END OF MODIFIED LOGIC ---

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
    $topicName = (Split-Path -Path $project.Directory.FullName -Parent | Split-Path -Leaf)

    if (-not (Test-Path -Path $destinationPath)) {
        New-Item -ItemType Directory -Path $destinationPath | Out-Null
    }

    $newZipName = "$sampleName.zip"
    Copy-Item -Path $project.FullName -Destination (Join-Path -Path $destinationPath -ChildPath $newZipName) -Force

    $shortDescription = $sampleName
    if (Test-Path -Path $sourceReadmePath) {
        $longDescription = Get-Content -Path $sourceReadmePath -Raw
    } else {
        $longDescription = "This sample has been developed from the business requirement of '$sampleName'."
    }
    $propertiesContent = "shortDescription = $shortDescription`r`nlongDescription = $longDescription"
    Set-Content -Path (Join-Path -Path $destinationPath -ChildPath "metadata.properties") -Value $propertiesContent

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
			<topic>$topicName</topic>
			<complexity>Getting Started</complexity>
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
Write-Log "Successfully processed and installed $processedCount Corticon.js samples."
Write-Log "Please restart Corticon.js Studio and navigate to Help -> Samples to see the new projects."