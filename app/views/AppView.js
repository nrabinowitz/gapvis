/*
 * Index View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        viewCache = [];
    
    // View: AppView (master view)
    gv.AppView = View.extend({
    
        initialize: function() {
            // initiatialize permalink
            new gv.PermalinkView();
            // listen for state changes
            state.bind('change:topview', this.updateView, this);
            state.bind('change:bookid', function() {
                // I think this is an app-level concern
                state.clearBookState(true);
            });
        },
        
        cached: function(cls) {
            var cached = _(viewCache).detect(function(c) {
                return c.view == cls;
            });
            // if no key has been set, this has not been cached
            if (!cached) {
                // instantiate and cache
                cached = {
                    view: cls,
                    instance: new cls({ parent: this })
                };
                viewCache.push(cached);
            } 
            return cached.instance;
        },
        
        // update the top-level view
        updateView: function() {
            var cls = state.get('topview'),
                view = this.cached(cls);
            this.open(view);
        },
        
        // close the current view and open a new one
        open: function(view) {
            if (view) {
                var oldview = this.currentView;
                if (oldview && oldview != view) {
                    oldview.close();
                }
                this.currentView = view;
                view.open();
            }
        }
    
    });
    
}(gv));