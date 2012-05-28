/*
 * Core setup for routers
 */
define(['gv'], function(gv) {
    var StateRouter = gv.StateRouter,
        superMethod = StateRouter.prototype.navigate;
    
    // set up default model
    gv.StateRouter = StateRouter.extend({
    
        navigate: function(route) {
            if (DEBUG) console.log('Navigating: ' + route);
            // ping analytics if available
            if (window._gaq) {
                _gaq.push(['_trackPageview', location.pathname + '#' + route]);
            }
            superMethod(route);
        }
        
    });
    
});