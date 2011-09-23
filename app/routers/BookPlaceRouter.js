/*
 * Book View Router
 */
(function(gv) {
    var state = gv.state,
        BookPlaceView = gv.BookPlaceView,
        BookPlaceRouter;
    
    BookPlaceRouter = gv.Router.extend({
        topview: BookPlaceView,
    
        initialize: function() {
            // listen for state changes
            state.bind('change:bookid',this.updateViewRoute, this);
            state.bind('change:placeid',this.updateViewRoute, this);
        },

        routes: {
            "book/:bookid/place/:placeid":     "summary",
        },
        
        summary: function(bookId, placeId) {
            // update parameters
            state.setSerialized('bookid', bookId);
            state.setSerialized('placeid', placeId);
            // update view
            state.set({ topview: BookPlaceView });
        },
        
        getRoute: function() {
            return 'book/' + state.get('bookid') + '/place/' + state.get('placeid');
        }

    });
    
    gv.AppRouter.register(BookPlaceRouter, BookPlaceView);
    
}(gv));