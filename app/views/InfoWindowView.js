/*
 * TimeMap View
 */
define(['gv', 'views/BookView', 'views/PlaceFrequencyBarsView'], 
    function(gv, BookView, PlaceFrequencyBarsView) {
    
    var state = gv.state;
    
    // View: InfoWindowView (content for the map infowindow)
    return BookView.extend({
        className: 'infowindow',
        template: '#info-window-template',
        
        initialize: function() {
            var view = this;
            // listen for state changes
            view.bindState('change:placeid',    view.render, view);
            view.bindState('change:pageid',     view.renderNextPrevControl, view);
            view.bindState('change:pageid',     view.renderBarHighlight, view);
            view.bindState('change:mapzoom',    view.renderZoomControl, view);
        },
        
        clear: function() {
            var view = this;
            view.freqBars && view.freqBars.clear();
            BookView.prototype.clear.call(view);
        },
        
        // render and update functions
        render: function() {
            var view = this;
            view.ready(function() {
                view.openWindow();
            })
        },
        
        openWindow: function() {
            var view = this,
                book = view.model,
                map = view.map,
                placeId = state.get('placeid'),
                place;
            // if no map has been set, give up
            if (!map) return;
            // if there's no place selected, close the window
            if (!placeId) {
                map.closeBubble();
                return;
            }
            // get the place
            place = book.places.get(placeId);
            // if the place isn't fully loaded, do so
            place.ready(function() {
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
                view.renderZoomControl();
                view.renderNextPrevControl();
                // open bubble
                map.openBubble(view.getPoint(), view.el);
                // set a handler to unset place if close is clicked
                function handler() {
                    if (state.get('placeid') == placeId) {
                        state.unset('placeid');
                    }
                    map.closeInfoBubble.removeHandler(handler);
                }
                map.closeInfoBubble.addHandler(handler);
            });
        },
        
        renderZoomControl: function() {
            this.$('.zoom').toggleClass('on', state.get('mapzoom') < 12);
        },
        
        renderNextPrevControl: function() {
            var view = this,
                pageId = state.get('pageid'),
                placeId = state.get('placeid');
            view.ready(function() {
                var book = view.model,
                    prev = view.prev = book.prevPlaceRef(pageId, placeId),
                    next = view.next = book.nextPlaceRef(pageId, placeId);
                view.$('.prev').toggleClass('on', !!prev);
                view.$('.next').toggleClass('on', !!next);
                view.$('.controls').toggle(!!(prev || next));
            });
        },
        
        renderBarHighlight: function() {
            var view = this;
            view.ready(function() {
                view.freqBars && view.freqBars.updateHighlight();
            });
        },
        
        getPoint: function() {
            var placeId = state.get('placeid'),
                place = this.model.places.get(placeId),
                ll = place.get('ll');
            return new mxn.LatLonPoint(ll[0], ll[1]);
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.zoom.on':       'uiZoom',
            'click span.next.on':       'uiNext',
            'click span.prev.on':       'uiPrev',
            'click span.goto-place':    'uiGoToPlace'
        },
        
        uiZoom: function() {
            var zoom = state.get('mapzoom');
            zoom = Math.min(zoom+2, 12);
            state.set({ 
                mapzoom: zoom, 
                mapcenter: this.getPoint()
            });
        },
        
        uiNext: function() {
            state.set({ pageid: this.next });
        },
        
        uiPrev: function() {
            state.set({ pageid: this.prev });
        },
        
        uiGoToPlace: function() {
            state.set({ 'view': 'place-view' });
        }
    });
    
});