/*
 * Book Summary Text View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        settings = gv.settings,
        // map styles
        mapStyle = settings.mapStyle,
        colorThemes = settings.colorThemes;
    
    // View: BookSummaryTextView (text content for the book summary)
    gv.BookSummaryMapView = View.extend({
        el: '#book-summary-map-view',
        
        // render and update functions
        
        layout: function() {
            $(this.el).height(
                this.topViewHeight() * .8 - 10 - $('#book-summary-text-view').height()
            )
            .width(
                this.topViewWidth() - 450
            );
        },
        
        render: function() {
            this.bindingLayout();
            
            var book = this.model,
                gmaps = google.maps,
                colorScale = d3.scale.quantize()
                    .domain([1, book.places.first().get('frequency')])
                    .range(colorThemes),
                bounds = book.gmapBounds(),
                gmap = new gmaps.Map(this.el, {
                    center: bounds.getCenter(),
                    zoom: 4,
                    mapTypeId: gmaps.MapTypeId.TERRAIN,
                    streetViewControl: false,
                    styles: mapStyle
                });
                
            // set bounds
            gmap.fitBounds(bounds);
            
            book.places.each(function(place) {
                var theme = colorScale(place.get('frequency')),
                    w = 10,
                    c = w/2,
                    icon = TimeMapTheme.getCircleUrl(w, theme.color, '99');
                    size = new gmaps.Size(w, w),
                    anchor = new gmaps.Point(c, c),
                    marker = new gmaps.Marker({
                        icon: new gmaps.MarkerImage(
                            icon,
                            size,
                            new gmaps.Point(0,0),
                            anchor,
                            size
                        ),
                        position: place.gmapLatLng(), 
                        map: gmap, 
                        title: place.get('title')
                    });
                // UI listener
                gmaps.event.addListener(marker, 'click', function() {
                    state.set({ placeid: place.id });
                    state.set({ topview: gv.BookPlaceView });
                });
            });
            
        }
    });
    
}(gv));