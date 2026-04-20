/**
 * MarkLogicStudioConfig.js — Studio Proxy Configuration
 *
 * Local credentials file for Corticon Studio testing via the ADC proxy.
 * DO NOT add this file to Corticon.js Extensions — it must never be bundled.
 * DO NOT commit this file to git — it is excluded by .gitignore.
 */

module.exports = {
    host: 'localhost',
    port: 8004,
    user: 'corticonml-admin',
    password: 'corticonml-admin',
    authType: 'digest',
    ssl: false,
    evalPath: '/v1/resources/StudioProxyService'
};
