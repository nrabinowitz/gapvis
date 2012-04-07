/*
 * Book Summary Text View
 */
(function(gv) {
    var state = gv.state;
    
    // View: BookSummaryTextView (text content for the book summary)
    gv.BookSummaryTextView = gv.BookView.extend({
        template: '#book-summary-text-template',
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model, 
                context = _.extend({}, book.toJSON(), {
                    pageCount: book.pages.length,
                    topPlaces: book.places.toJSON().slice(0,4)
                });
            // fill in template
            view.renderTemplate(context);
            // buttonize reading link
            view.$('button.goto-reading').button({
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
                state.set('placeid', placeId);
                state.set({ 'view': 'place-view' });
            }
        },
        
        uiGoToReading: function() {
            state.set({ 'view': 'reading-view' });
        }
    });
    
}(gv));