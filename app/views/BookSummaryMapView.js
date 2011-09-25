/*
 * Book Summary Text View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        settings = gv.settings,
        // map styles
        mapStyle = settings.mapStyle,
        scaleColors = settings.scaleColors,
        colorThemes = settings.colorThemes;
    
    // View: BookSummaryTextView (text content for the book summary)
    gv.BookSummaryMapView = View.extend({
        el: '#book-summary-map-view',
        
        // render and update functions
        
        layout: function() {
            $(this.el).height(
                this.topViewHeight() * .8 - 10 - $('#book-summary-text-view').height()
            );
        },
        
        render: function() {
            this.bindingLayout();
        },
    });
    
}(gv));