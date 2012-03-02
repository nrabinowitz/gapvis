/*
 * Book View Router
 */
(function(gv) {
    var state = gv.state,
        BookReadingView = gv.BookReadingView,
        BookRouter;
    
    BookRouter = gv.Router.extend({
        topview: BookReadingView,
    
        initialize: function() {
            // listen for state changes
            state.bind('change:bookid',this.updateViewRoute, this);
            state.bind('change:pageid', this.updateViewRoute, this);
            state.bind('change:placeid', this.updateViewRoute, this);
        },

        routes: {
            "book/:bookid/read":                    "book",
            "book/:bookid/read/:pageid":            "book",
            "book/:bookid/read/:pageid/:placeid":   "book"
        },
        
        book: function(bookId, pageId, placeId) {
            // update parameters
            state.setSerialized('bookid', bookId);
            state.setSerialized('pageid', pageId || '');
            state.setSerialized('placeid', placeId);
            // update view
            state.set({ topview: BookReadingView });
        },
        
        getRoute: function() {
            return 'book/' + state.get('bookid') + '/read' +
                (state.get('pageid') ? '/' + state.get('pageid') +
                    (state.get('placeid') ? '/' + state.get('placeid') : '')
                : '');
        }

    });
    
    gv.AppRouter.register(BookRouter, BookReadingView);
    
}(gv));