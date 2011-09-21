/*
 * Index View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        BookListView;
    
    // View: BookListView (item in book index)
    BookListView = View.extend({
        tagName: 'li',
        
        render: function() {
            $(this.el).html(this.model.get('title'));
            return this;
        },
        
        events: {
            "click": "uiOpenBook"
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
            books.bind('reset', this.render, this);
            books.fetchNew();
        },
        
        render: function() {
            var $list = this.$("#book-list");
            $list.empty();
            this.model.forEach(function(book) {
                var view = new BookListView({ model:book });
                $list.append(view.render().el);
            })
        },
        
        open: function() {
            $(this.el).show();
        }
    });
    
}(gv));