/*
 * Top-level namespace for the GapVis application
 */
define(function() {

    // removed in production by uglify
    if (typeof DEBUG === 'undefined') {
        DEBUG = true;
        API_ROOT = '/api';
        REPORT_URL = '/api/report/issue';
        API_DATA_TYPE = 'json';
    }

    var gv = window.gv = _.extend(spf, {
        // core settings (set from config)
        settings: {
            API_ROOT: API_ROOT,
            REPORT_URL: REPORT_URL,
            API_DATA_TYPE: API_DATA_TYPE
        }
    });
    
    return gv;
});