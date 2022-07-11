
REM Function app and storage account names must be unique 
REM Update 4am - Turns out Storage account name must be between 3 and 24 characters in length and use numbers and lower-case letters only.

set resourceGroupName=CorticonTesting
set storageName=corticonstorage
set functionAppName=CarsDecisionService
REM Change to whichever region you set as preference when creating the Azure account, for a list of region shorthands run: az account list-locations
REM NB the last command (functionapp create) complains about 0 available instances when using "westeurope" as region, for now "eastus" seems to work.
REM It's unfortunately ungoogleable which regions work on the trial/free tier for creating apps :/
set region=eastus

REM Create a resource group.
REM Create an Azure storage account in the resource group.
REM Create a serverless function app in the resource group.

az group create --name %resourceGroupName% --location %region% && ^
az storage account create --name %storageName% --location %region% --resource-group %resourceGroupName% --sku Standard_LRS && ^
az functionapp create --name %functionAppName% --storage-account %storageName% --consumption-plan-location %region% --resource-group %resourceGroupName% --functions-version 3


