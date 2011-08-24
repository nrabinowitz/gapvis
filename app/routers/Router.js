/*
 * Core setup for routers
 */
(function(gv) {
    
    // set up default model
    gv.Router = Backbone.Router.extend({
    
        // navigate to the current route
        getRoute: function() {
            // (override in subclasses)
            return '';
        },
        
        // update the url based on the current state
        updateRoute: function() {
            this.navigate(this.getRoute());
        }
        
    });
    
}(gv));