/*
 * Book Reading View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookReadingView (master view for the book reading screen)
    gv.BookPlaceView = gv.BookView.extend({
        el: '#book-place-view',
        
        initialize: function(opts) {
            var view = this;
            // set child classes
            view.childClasses = [
                gv.BookTitleView,
                gv.PlaceSummaryView
            ];
            // super initialization kicks off model fetch
            gv.BookView.prototype.initialize.call(this);
        }
        
    });
    
}(gv));