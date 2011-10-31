/*
 * Index View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        topviewOrder = [
            gv.IndexView,
            gv.BookSummaryView,
            gv.BookReadingView,
            gv.BookPlaceView
        ],
        viewCache = [];
    
    // View: AppView (master view)
    gv.AppView = View.extend({
        el: 'body',
    
        initialize: function() {
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
            this.open(view, cls);
        },
        
        // close the current view and open a new one
        open: function(view, cls) {
            if (view) {
                var oldview = this.currentView,
                    // default: slides in from left
                    fromRight = true;
                if (oldview && oldview != view) {
                    // get the old view class
                    oldCls = _(viewCache).detect(function(c) {
                        return c.instance == oldview;
                    }).view;
                    // work out left/right
                    fromRight = topviewOrder.indexOf(oldCls) < topviewOrder.indexOf(cls);
                    oldview.close(fromRight);
                }
                this.currentView = view;
                view.open(fromRight);
            }
        }
    
    });
    
}(gv));