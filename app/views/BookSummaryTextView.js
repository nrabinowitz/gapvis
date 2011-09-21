/*
 * Book Summary Text View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookSummaryTextView (text content for the book summary)
    gv.BookSummaryTextView = View.extend({
        el: '#book-summary-text-view',
        
        initialize: function(opts) {
            this.template = _.template($('#book-summary-text-template').html());
        },
        
        // render and update functions
        
        render: function() {
            var book = this.model, 
                context = _.extend({}, book.toJSON(), {
                    pageCount: book.pages.length,
                    topPlaces: book.places.toJSON().slice(0,4)
                });
            $(this.el).html(this.template(context));
            this.$('button.goto-reading').button({
                icons: {
                    secondary: 'ui-icon-triangle-1-e'
                }
            });
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.place':             'uiPlaceClick',
            'click button.goto-reading':    'uiGoToReading'
        },
        
        uiPlaceClick: function(e) {
            var placeId = $(e.target).attr('data-place-id');
            if (placeId) {
                state.setSerialized('placeid', placeId);
                state.set({ topview: gv.BookPlaceView });
            }
        },
        
        uiGoToReading: function() {
            state.set({ 'topview': gv.BookReadingView });
        }
    });
    
}(gv));