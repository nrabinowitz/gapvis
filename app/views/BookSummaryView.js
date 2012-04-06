/*
 * Book Summary View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookSummaryView (master view for the book summary screen)
    gv.BookSummaryView = View.extend({
        el: '#book-summary-view',
        
        initialize: function(opts) {
            var view = this;
            // set child classes
            view.childClasses = [
                gv.NavigationView,
                gv.BookTitleView,
                gv.BookSummaryTextView,
                gv.BookSummaryMapView,
                gv.PlaceFrequencyBarsView
            ];
            // super initialization kicks off model fetch
            gv.BookView.prototype.initialize.call(this);
        }
        
    });
    
}(gv));