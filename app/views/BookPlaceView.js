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
            console.log('(BookPlaceView) initializing');
            var view = this;
            // set child classes
            view.childClasses = [
                gv.NavigationView,
                gv.BookTitleView,
                gv.PlaceSummaryView,
                gv.RelatedPlacesView
            ];
            // bind state
            this.bindState('change:placeid', function() {
                console.log('handler called');
                view.refresh();
            });
            // super initialization kicks off model fetch
            gv.BookView.prototype.initialize.call(this);
        },
        
        refresh: function() {
            console.log('(BookPlaceView) refreshing');
            // XXX - this is killing all the event bindings :(
            this.children.forEach(function(child) {
                child.clear();
            });
            // create child views and render
            this.updateViews().render();
        }
        
    });
    
}(gv));