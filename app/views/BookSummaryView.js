/*
 * Book Summary View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookSummaryView (master view for the book summary screen)
    gv.BookSummaryView = gv.BookView.extend({
        el: '#book-summary-view',
        
        initialize: function(opts) {
            var view = this;
            // set child classes
            view.childClasses = [
                gv.NavigationView,
                gv.BookTitleView,
                gv.PlaceFrequencyBarsView
            ];
            // super initialization kicks off model fetch
            gv.BookView.prototype.initialize.call(this);
        },
        
        // UI event handlers
        
        events: {
            "click .goto-reading": "uiGoToReading"
        },
        
        uiGoToReading: function() {
            state.set({ 'topview': gv.BookReadingView });
        }
        
    });
    
}(gv));