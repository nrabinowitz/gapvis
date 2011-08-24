/*
 * Index View
 */
(function(window, gv) {
    var View = gv.View,
        state = gv.state,
        BookListView, IndexView;
    
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
            state.set({ 'topview': BookView });
        }
    });
        
    // View: IndexView (index page)
    IndexView = gv.IndexView = View.extend({
        el: '#index-view',
        
        initialize: function() {
            var books = this.model = new gv.BookList();
            books.bind('reset', this.addList, this);
            books.fetch();
        },
        
        addList: function() {
            this.model.forEach(function(book) {
                var view = new BookListView({ model:book });
                this.$("#book-list").append(view.render().el);
            })
        }
    });
    
}(window, gv));