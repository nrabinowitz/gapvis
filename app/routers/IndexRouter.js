/*
 * Book View Router
 */
(function(window, gv) {
    var state = gv.state,
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
    
    gv.AppRouter.register(IndexRouter, gv.IndexView);
    
}(window, gv));