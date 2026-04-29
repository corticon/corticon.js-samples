/**
 * MarkLogicStudioConfig.template.js — Studio Proxy Configuration Template
 *
 * *** SETUP INSTRUCTIONS ***
 *
 * 1. Copy this file to "MarkLogicStudioConfig.js" (same directory):
 *        cp MarkLogicStudioConfig.template.js MarkLogicStudioConfig.js
 *
 * 2. Fill in your MarkLogic connection details below.
 *
 * 3. DO NOT add MarkLogicStudioConfig.js to the Corticon.js Extensions list.
 *    It must NOT be bundled into the deployed decision service. The SCO loads
 *    it at runtime only when running in Node.js (Corticon Studio test facility).
 *
 * 4. DO NOT commit MarkLogicStudioConfig.js to git — it contains credentials.
 *    It is already excluded by the .gitignore entry at the repo root.
 *
 * 5. Ensure StudioProxyService.sjs and the two ADC library files are deployed
 *    to MarkLogic's modules database. Run:
 *      AdvancedDataConnectorML/scripts/deploy-studio-proxy.ps1
 */

module.exports = {
    // MarkLogic host (IP or hostname)
    host: 'localhost',

    // MarkLogic REST app server port
    port: 8004,

    // MarkLogic user with rest-reader (and rest-writer for write steps) privileges
    user: 'user-name',

    // MarkLogic password
    password: 'user-password',

    // Authentication type: 'digest' (MarkLogic default) or 'basic'
    authType: 'digest',

    // Use HTTPS (set to true if your app server is SSL-enabled)
    ssl: false,

    // Path to the Studio Proxy resource extension (registered via /v1/config/resources/)
    evalPath: '/v1/resources/StudioProxyService'
};
