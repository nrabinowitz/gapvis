/*
 * Index View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        BookListView;
    
    // View: BookListView (item in book index)
    BookListView = View.extend({
        tagName: 'p',
        
        initialize: function() {
            this.template = _.template($('#book-list-template').html());
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        events: {
            "click .book-title": "uiOpenBook"
        },
        
        uiOpenBook: function() {
            state.set({ 'bookid': this.model.id });
            state.set({ 'topview': gv.BookSummaryView });
        }
    });
        
    // View: IndexView (index page)
    gv.IndexView = View.extend({
        el: '#index-view',
        
        initialize: function() {
            var books = this.model = gv.books;
            books.on('reset', this.render, this);
            books.fetchNew();
        },
        
        layout: function() {
            $('#book-list-view, #instructions').height(
                this.topViewHeight() - 50
            );
            $('#instructions').width(
                this.topViewWidth() - $('#book-list-view').width() - 100
            );
        },
        
        render: function() {
            // size the index panel
            this.bindingLayout();
            // remove the loading image
            $('#book-list-view').removeClass('loading');
            // make the book list
            var $list = this.$("#book-list");
            $list.empty();
            this.model.forEach(function(book) {
                var view = new BookListView({ model:book });
                $list.append(view.render().el);
            })
        },
        
        open: function(fromRight) {
            $(this.el)
                .height(this.topViewHeight())
                .show('slide', {direction: (fromRight ? 'right' : 'left') }, 500);
        },
        
        close: function(fromRight) {
            $(this.el).hide('slide', {direction: (fromRight ? 'left' : 'right') }, 500);
        }
    });
    
}(gv));