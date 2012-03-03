/*
 * TimeMap View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: InfoWindowView (content for the map infowindow)
    gv.PlaceSummaryView = View.extend({
        el: '#place-summary-view',
        
        initialize: function(opts) {
            this.template = _.template($('#place-summary-template').html());
        },
        
        clear: function() {
            this.freqBars && this.freqBars.clear();
            View.prototype.clear.call(this);
        },
        
        layout: function() {
            $('#place-summary-container').height(
                this.topViewHeight() - $('#book-place-view .book-title-view').height() - 50
            );
        },
        
        // render and update functions
        
        render: function() {
            this.bindingLayout();
            
            var view = this,
                book = view.model,
                placeId = state.get('placeid'),
                place;
            // if no map or place has been set, give up
            if (!placeId) {
                return;
            }
            // get the place
            place = book.places.get(placeId);
            if (!place.isFullyLoaded()) {
                $('#place-summary-container').addClass('loading');
            }
            place.ready(function() {
                $('#place-summary-container').removeClass('loading');
                // create content
                $(view.el).html(view.template(place.toJSON()));
                // add frequency bars
                var freqBars = view.freqBars = new gv.PlaceFrequencyBarsView({
                    model: book,
                    place: place,
                    el: view.$('div.frequency-bars')[0]
                });
                // render sub-elements
                freqBars.render();
                view.renderBarHighlight();
            });
            return this;
        },
        
        renderBarHighlight: function() {
            this.freqBars.updateHighlight();
        }
    });
    
}(gv));