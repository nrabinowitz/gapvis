/*
 * Book View
 */
define(['gv'], function(gv) {

    // View: BookView (parent class for book views)
    return gv.View.extend({
        // utility - render an underscore template to this el's html
        renderTemplate: function(context) {
            var view = this,
                template = _.template(view.template);
            context = context || view.model.toJSON();
            $(view.el).html(template(context));
        },
        
        ready: function(callback) {
            var view = this,
                state = gv.state,
                bookId = state.get('bookid'),
                book = view.model;
            if (!book || book.id != bookId || !book.isFullyLoaded()) {
                book = view.model = gv.books.getOrCreate(bookId);
                book.ready(function() {
                    // set the page id if not set
                    if (!state.get('pageid')) {
                        state.set({ pageid: book.firstId() });
                    }
                    callback();
                });
            } else {
                callback();
            }
        }
        
    });
    
});