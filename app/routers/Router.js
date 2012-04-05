/*
 * Core setup for routers
 */
(function(gv) {
    
    // set up default model
    gv.Router = gv.Router.extend({
    
        updateRoute: function() {
            var route = this.getRoute();
            // ping analytics if available
            if (window._gaq) {
                _gaq.push(['_trackPageview', location.pathname + '#' + route]);
            }
            this.navigate(route);
        }
        
    });
    
}(gv));