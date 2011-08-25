/*
 * Book Title View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        BookSummaryView = gv.BookSummaryView;
    
    // View: BookTitleView (title and metadata)
    gv.BookTitleView = View.extend({
        tagName: 'div',
    
        initialize: function() {
            this.template = _.template($('#book-title-template').html())
        },
        
        render: function() {
            // render content and append to parent
            $(this.el).html(this.template(this.model.toJSON()))
                .appendTo(this.options.parent.$('div.book-title-view'));
            this.$('h2.book-title').toggleClass('on', state.get('topview') != BookSummaryView);
            return this;
        },
        
        // UI event handlers
        
        events: {
            "click h2.book-title":      "uiGoToSummary"
        },
        
        uiGoToSummary: function() {
            console.log('here');
            state.set({ 'topview': BookSummaryView });
        }
    });
    
}(gv));