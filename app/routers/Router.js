/*
 * Core setup for routers
 */
define(['gv'], function(gv) {
    var StateRouter = gv.StateRouter;
    
    // set up default model
    gv.StateRouter = StateRouter.extend({
    
        updateRoute: function() {
            var route = this.getRoute();
            if (DEBUG) console.log('Routing: ' + route);
            // ping analytics if available
            if (window._gaq) {
                _gaq.push(['_trackPageview', location.pathname + '#' + route]);
            }
            this.navigate(route);
        }
        
    });
    
});