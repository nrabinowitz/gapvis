/*
 * Related Places View
 */
define(['gv', 'views/BookView', 'models/Collection',], function(gv, BookView, Collection) {
    var state = gv.state,
        BookRefs;
        
    // make a nonce collection to hold related books
    BookRefs = Collection.extend({
        model: Backbone.Model,
        initialize: function(models, opts) {
            this.placeId = opts.placeId;
        },
        url: function() {
            return gv.settings.API_ROOT + '/places/' + this.placeId + '/books.json';
        },
        comparator: function(book) {
            return -book.get('tokenCount');
        }
    });
    
    // View: BookReferencesView (list of places)
    return BookView.extend({
        className: 'book-refs-view loading',
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model,
                placeId = state.get('placeid'),
                refs;
            // if no place has been set, give up
            if (!placeId) return;
            // create collection and fetch
            refs = view.refs = new BookRefs([], { placeId: placeId });
            refs.fetch({
                success: function() {
                    view.renderRefs();
                },
                error: function() {
                    if (DEBUG) console.error('Failed to load related places');
                }
            });
            // create content
            view.$el.append('<h4>Book References</h4>');
            return this;
        },
        
        renderRefs: function() {
            var view = this,
                refs = view.refs,
                bookId = state.get('bookid'),
                // just make the template inline
                template = _.template('<p><span class="book-title control on" data-book-id="<%= id %>">' +
                    '<%= title %></span> (<%= tokenCount %>)</p>');
            view.$el.removeClass('loading');
            // create list
            refs = refs.filter(function(book) {
                return book.id != bookId;
            });
            if (refs.length)
                refs.slice(0, gv.settings.bookRefCount)
                .forEach(function(book) {
                    view.$el.append(template(book.toJSON()));
                });
            else view.$el.append('<p>No other book references were found.</p>');
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.book-title': 'uiRefClick'
        },
        
        uiRefClick: function(e) {
            var bookId = $(e.target).attr('data-book-id'),
                placeId = state.get('placeid');
            if (bookId) {
                state.set('bookid', bookId);
                // reset place
                state.set({ placeid: placeId });
                gv.app.updateView(true);
            }
        }
    });
    
});