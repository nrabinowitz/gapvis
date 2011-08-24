/*
 * Book View Router
 */
(function(gv) {
    var state = gv.state,
        IndexView = gv.IndexView,
        IndexRouter;
    
    IndexRouter = gv.Router.extend({

        routes: {
            "": "index"
        },
        
        index: function() {
            // update view
            state.set({ topview: IndexView });
        },
        
        getRoute: function() {
            return 'index';
        }

    });
    
    gv.AppRouter.register(IndexRouter, IndexView);
    
}(gv));