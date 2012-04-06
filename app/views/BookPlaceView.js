/*
 * Book Place View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookPlaceView (master view for the book place detail screen)
    gv.BookPlaceView = View.extend({
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
            BookView.prototype.initialize.call(this);
        },
        
        refresh: function() {
            this.children.forEach(function(child) {
                child.clear();
            });
            // create child views and render
            this.updateViews().render();
        },
        
        // UI Events
        
        events: {
            'click span.change-this':   'uiOpenForm'
        },
        
        uiOpenForm: function() {
            // set the place to edit in the state
            state.set({ changelinkid: state.get('placeid') });
            // instantiate and open form
            if (!this.form) {
                this.form = new gv.ChangeFormView({ model: this.model, placeOnly: true });
            }
            this.form.open();
        }
        
    });
    
}(gv));