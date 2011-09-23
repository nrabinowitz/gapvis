/*
 * Book View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookView (parent class for the book screens)
    gv.BookView = View.extend({
        
        initialize: function(opts) {
            var view = this;
            // listen for state changes
            state.bind('change:bookid', function() {
                if ($(view.el).is(':visible')) {
                    view.updateBook();
                }
            });
        },
        
        updateViews: function() {
            var view = this,
                book = view.model;
            view.children = view.childClasses.map(function(cls) {
                return new cls({ 
                    model: book,
                    parent: view
                })
            });
            return view;
        },
        
        // Render functions
        
        render: function() {
            var view = this;
            // render all children
            view.children.forEach(function(child) {
                child.render();
            });
            view.layout();
            view.rendered = true;
            return view;
        },
        
        clear: function() {
            // delete contents of all children
            this.children.forEach(function(child) {
                child.clear();
            });
            this.$('#page-view').empty();
            this.$('div.book-title-view').empty();
        },
        
        open: function() {
            $(this.el).show('slide', {direction: 'right' }, 500);
            this.updateBook();
        },
        
        close: function() {
            $(this.el).hide('slide', {direction: 'right' }, 500);
        },
        
        // Model update functions
        
        updateBook: function() {
            var view = this,
                bookId = state.get('bookid'),
                book = view.model;
            if (!book || book.id != bookId) {
                book = view.model = gv.books.getOrCreate(bookId);
                book.ready(function() {
                    // set the page id if not set
                    if (!state.get('pageid')) {
                        state.set({ pageid: book.firstId() });
                    }
                    // clear out previously rendered content
                    if (view.rendered) {
                        view.clear();
                    }
                    // create child views and render
                    view.updateViews().render();
                });
            }
        }
        
    });
    
}(gv));