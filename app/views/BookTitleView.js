/*
 * Book Title View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        BookTitleView;
    
    // View: BookTitleView (title and metadata)
    BookTitleView = View.extend({
        el: '#book-title-view',
        
        initialize: function() {
            this.template = _.template($('#book-title-template').html())
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });
    // register
    gv.registerChildView(gv.BookView, BookTitleView);
    
}(gv));