/*
 * Book View Router
 */
(function(window, gv) {
    var state = gv.state,
        BookRouter;
    
    BookRouter = gv.Router.extend({
    
        initialize: function() {
            // listen for state changes
            state.bind('change:bookid',this.updateRoute, this);
            state.bind('change:pageid', this.updateRoute, this);
            state.bind('change:placeid', this.updateRoute, this);
        },

        routes: {
            "book/:bookid":                     "book",
            "book/:bookid/:pageid":             "book",
            "book/:bookid/:pageid/:placeid":    "book"
        },
        
        book: function(bookId, pageId, placeId) {
            // look for querystring. XXX: not thrilled with doing this here.
            bookId = this.parseQS(bookId);
            pageId = this.parseQS(pageId);
            placeId = this.parseQS(placeId);
            // update parameters
            state.setSerialized('bookid', bookId);
            state.setSerialized('pageid', pageId);
            state.setSerialized('placeid', placeId);
            // update view
            state.set({ topview: BookView });
        },
        
        getRoute: function() {
            return 'book/' + state.get('bookid') + 
                (state.get('pageid') ? '/' + state.get('pageid') +
                    (state.get('placeid') ? '/' + state.get('placeid') : '')
                : '');
        }

    });
    
    gv.AppRouter.register(BookRouter, gv.BookView);
    
}(window, gv));