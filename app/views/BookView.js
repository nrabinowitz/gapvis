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
                view.clear();
                view.updateBook();
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
            // render all children
            this.children.forEach(function(child) {
                child.render();
            });
            return this;
        },
        
        clear: function() {
            // delete contents of all children
            view.children.forEach(function(child) {
                child.clear();
            });
            $('page-view').empty();
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
                book;
            if (!view.model || view.model.id != bookId) {
                book = view.model = gv.books.getOrCreate(bookId);
            }
            function update() {
                if (!state.get('pageid')) {
                    state.set({ pageid: book.firstId() });
                }
                view.updateViews().render();
            }
            if (!book.isFullyLoaded()) {
                book.fetch({ 
                    success: function() {
                        book.initCollections();
                        update();
                    },
                    error: function() {
                        console.log('Error fetching book ' + book.id)
                    }
                });
            } else {
                update();
            }
        }
        
    });
    
}(gv));