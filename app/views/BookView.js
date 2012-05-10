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
            if (!book || book.id != bookId) {
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
    
    // parent for views that require a place
    // XXX: Currently unreachable, should be a separate file
    var PlaceView = BookView.extend({
        
        ready: function(callback) {
            var view = this,
                placeId = gv.state.get('placeid');
            // if no place has been set, give up
            if (!placeId) return;
            // get the book, then the place
            BookView.prototype.ready.call(view, function() {
                view.model.places.get(placeId)
                    .ready(callback)
            });
        }
        
    });
    
});