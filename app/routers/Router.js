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
        },
        
        // update the url if this router's view is the top view
        updateViewRoute: function() {
            if (this.topview && this.topview == gv.state.get('topview')) {
                this.updateRoute();
            }
        }
        
    });
    
}(gv));