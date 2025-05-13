/**
 * PostgreSQLServiceCallout.js (Modified for Browser Compatibility)
 */

const getDriverDutyStatusMetadata = {
    func: 'getDriverDutyStatusByLicenseNo',
    type: 'ServiceCallout',
    description: { 'en_US': 'Retrieves dutyStatus for Driver entities via a backend service.' },
    extensionType: 'SERVICE_CALLOUT',
    name: { 'en_US': 'GetDriverDutyStatusViaBackend' }
};

let logger;

async function getDriverDutyStatusByLicenseNo(corticonDataManager, serviceCalloutProperties, mappedPayload) {
    logger = corticonDataManager.getLogger();
    logger.logDebug('[PostgreSQLServiceCallout.getDriverDutyStatusByLicenseNo] === SCO EXECUTION STARTED ===');

    let entitiesProcessedCount = 0;
    let entitiesUpdatedCount = 0;

    try {
        const driverEntities = corticonDataManager.getEntitiesByType('Driver');

        for (const driverEntity of driverEntities) {
            entitiesProcessedCount++;
            const licenseNo = driverEntity['licenseNo'];

            if (!licenseNo || typeof licenseNo !== 'string' || licenseNo.trim() === '') {
                logger.logWarn(`[PostgreSQLServiceCallout.getDriverDutyStatusByLicenseNo] Skipping due to missing/invalid licenseNo.`);
                driverEntity['dutyStatus'] = null;
                continue;
            }

            logger.logDebug(`[PostgreSQLServiceCallout.getDriverDutyStatusByLicenseNo] Processing licenseNo: ${licenseNo}`);

            try {
                const response = await fetch(`http://localhost:3000/driverDutyStatus/${licenseNo}`); // Call backend service
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                driverEntity['dutyStatus'] = data.dutyStatus;
                if (data.dutyStatus) {
                    entitiesUpdatedCount++;
                }
                logger.logDebug(`[PostgreSQLServiceCallout.getDriverDutyStatusByLicenseNo] Updated ${licenseNo} with status: ${data.dutyStatus}`);

            } catch (fetchError) {
                logger.logError(`[PostgreSQLServiceCallout.getDriverDutyStatusByLicenseNo] Error fetching status: ${fetchError}`);
                driverEntity['dutyStatus'] = null;
            }
        }

        logger.logDebug(`[PostgreSQLServiceCallout.getDriverDutyStatusByLicenseNo] === SCO EXECUTION COMPLETED === Processed: ${entitiesProcessedCount}, Updated: ${entitiesUpdatedCount}.`);
        return { status: 'success', processed: entitiesProcessedCount, updated: entitiesUpdatedCount };

    } catch (generalError) {
        logger.logError(`[PostgreSQLServiceCallout.getDriverDutyStatusByLicenseNo] General error: ${generalError}`);
        return { status: 'error', errorMessage: generalError.message };
    }
}

exports.getDriverDutyStatusByLicenseNo = getDriverDutyStatusByLicenseNo;
exports.getDriverDutyStatusMetadata = getDriverDutyStatusMetadata;