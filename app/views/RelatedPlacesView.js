/*
 * Related Places View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: RelatedPlacesView (list of related places based on collocation)
    return BookView.extend({
        className: 'related-places-view',
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model,
                placeId = state.get('placeid'),
                place;
            // if no place has been set, give up
            if (!placeId) return;
            // get the place
            place = book.places.get(placeId);
            place.ready(function() {
                var related = place.related(book).slice(0, gv.settings.relatedCount);
                // create content
                view.$el.append('<h4>Top Related Places</h4>');
                related.forEach(function(r) {
                    $('<p><span class="place" data-place-id="' + 
                        r.place.id + '">' + r.place.get('title') +
                        '</span> (' + r.count + ')</p>').appendTo(view.el);
                })
            });
            return this;
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.place':             'uiPlaceClick'
        },
        
        uiPlaceClick: function(e) {
            var placeId = $(e.target).attr('data-place-id');
            if (placeId) state.set('placeid', placeId);
        }
    });
    
});