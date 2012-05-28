/*
 * TimeMap View
 */
define(['gv', 'views/BookView', 'views/PlaceFrequencyBarsView'], 
    function(gv, BookView, PlaceFrequencyBarsView) {
    
    var state = gv.state;
    
    // View: PlaceSummaryView
    return BookView.extend({
        className: 'place-summary-view loading',
        template: '#place-summary-template',
        
        clear: function() {
            this.freqBars && this.freqBars.clear();
            BookView.prototype.clear.call(this);
        },
        
        // render and update functions
        
        render: function() {
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
            place.ready(function() {
                view.$el.removeClass('loading');
                // create content
                view.renderTemplate(place.toJSON());
                // add frequency bars
                var freqBars = view.freqBars = new PlaceFrequencyBarsView({
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
    
});