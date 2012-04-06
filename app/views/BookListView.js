/*
 * Index View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        BookListItemView;
    
    // View: BookListView (item in book index)
    BookListItemView = View.extend({
        tagName: 'p',
        
        initialize: function() {
            this.template = _.template($('#book-list-item-template').html());
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
            state.set({ 'view': 'book-summary' });
        }
    });
        
    // View: IndexView (index page)
    gv.BookListView = View.extend({
        el: '#book-list-view',
        
        initialize: function() {
            var books = this.model = gv.books;
            books.on('reset', this.render, this);
            books.fetchNew();
        },
        
        render: function() {
            var view = this;
            // make content
            view.$el
                .html($('#book-list-template').html())
                .removeClass('loading');
            // make the book list
            $('#book-list').empty();
            view.model.forEach(function(book) {
                var item = new BookListItemView({ model:book });
                view.$el.append(item.render().el);
            });
        }
    });
    
}(gv));