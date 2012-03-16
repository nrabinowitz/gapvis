/*
 * Book View Router
 */
(function(gv) {
    var state = gv.state,
        BookSummaryView = gv.BookSummaryView,
        BookSummaryRouter;
    
    BookSummaryRouter = gv.Router.extend({
        topview: BookSummaryView,
    
        initialize: function() {
            // listen for state changes
            state.on('change:bookid',this.updateViewRoute, this);
        },

        routes: {
            "book/:bookid":     "summary"
        },
        
        summary: function(bookId) {
            // update parameters
            state.setSerialized('bookid', bookId);
            // update view
            state.set({ topview: BookSummaryView });
        },
        
        getRoute: function() {
            return 'book/' + state.get('bookid');
        }

    });
    
    gv.AppRouter.register(BookSummaryRouter, BookSummaryView);
    
}(gv));