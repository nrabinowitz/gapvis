/*
 * Book Place View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookPlaceView (master view for the book place detail screen)
    gv.BookPlaceView = gv.BookView.extend({
        el: '#book-place-view',
        
        initialize: function(opts) {
            var view = this;
            // set child classes
            view.childClasses = [
                gv.NavigationView,
                gv.BookTitleView,
                gv.PlaceSummaryView,
                gv.RelatedPlacesView,
                gv.BookPlaceMapView,
                gv.BookPlaceFlickrView
            ];
            // bind state
            this.bindState('change:placeid', this.refresh, this);
            // super initialization kicks off model fetch
            gv.BookView.prototype.initialize.call(this);
        },
        
        refresh: function() {
            this.children.forEach(function(child) {
                child.clear();
            });
            // create child views and render
            this.updateViews().render();
        }
        
    });
    
}(gv));