/*
 * Core setup for routers
 */
(function(window, gv) {
    
    // set up default model
    var Backbone = window.Backbone;
    
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
    
}(window, gv));