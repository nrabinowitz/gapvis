/*
 * TimeMap View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: InfoWindowView (content for the map infowindow)
    gv.InfoWindowView = View.extend({
        tagName: 'div',
        className: 'infowindow',
        
        initialize: function(opts) {
            this.template = _.template($('#info-window-template').html());
            // listen for state changes
            this.bindState('change:placeid', this.render, this);
            this.bindState('change:pageid', this.renderNextPrevControl, this);
            this.bindState('change:pageid', this.renderBarHighlight, this);
            this.bindState('change:mapzoom', this.renderZoomControl, this);
        },
        
        clear: function() {
            this.freqBars && this.freqBars.clear();
            View.prototype.clear.call(this);
        },
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model,
                map = view.map,
                placeId = state.get('placeid'),
                place;
            // if no map or place has been set, give up
            if (!map || !placeId) {
                return;
            }
            // get the place
            place = book.places.get(placeId);
            // if the place isn't fully loaded, do so
            place.ready(function() {
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
            return this;
        },
        
        renderZoomControl: function() {
            this.$('.zoom').toggleClass('on', state.get('mapzoom') < 12);
        },
        
        renderNextPrevControl: function() {
            var book = this.model,
                pageId = state.get('pageid'),
                placeId = state.get('placeid'),
                prev = this.prev = book.prevPlaceRef(pageId, placeId);
                next = this.next = book.nextPlaceRef(pageId, placeId);
            this.$('.prev').toggleClass('on', !!prev);
            this.$('.next').toggleClass('on', !!next);
            this.$('.controls').toggle(!!(prev || next));
        },
        
        renderBarHighlight: function() {
            if (this.freqBars) {
                this.freqBars.updateHighlight();
            }
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
            state.set({ 'topview': gv.BookPlaceView });
        }
    });
    
}(gv));