/*
 * Book Title View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookTitleView (title and metadata)
    gv.BookTitleView = View.extend({
    
        initialize: function() {
            this.el = this.options.parent.$('div.book-title-view');
            this.template = _.template($('#book-title-template').html())
        },
        
        render: function() {
            // render content in parent context
            $(this.el).html(this.template(this.model.toJSON()))
            return this;
        }
    });
    
}(gv));