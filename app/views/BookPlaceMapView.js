/*
 * Place Detail Map View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        settings = gv.settings,
        // map styles
        mapStyle = settings.mapStyle,
        colorThemes = settings.colorThemes;
    
    // View: BookPlaceMapView (map content for the place detail page)
    return BookView.extend({
        className: 'place-map-view panel fill',
        
        // render and update functions
        
        render: function() {
            if (DEBUG && !window.google) return;
            var view = this,
                placeId = state.get('placeid'),
                book = view.model,
                place;
                
            // if no place has been set, give up
            if (!placeId) return;
            // get the place
            place = book.places.get(placeId),
            
            // load map when the place is ready 
            place.ready(function() {
                var related = place.related(book).slice(0, settings.relatedCount),
                    placePoint = place.gmapLatLng(),
                    gmaps = google.maps,
                    colorScale = d3.scale.quantize()
                        .domain([1, book.places.first().get('frequency')])
                        .range(colorThemes),
                    strokeScale = d3.scale.linear()
                        .domain([1, d3.max(related, function(d) { return d.count })])
                        .range([1,10]),
                    // determine bounds
                    bounds = related.reduce(function(bounds, r) {
                            return bounds.extend(r.place.gmapLatLng());
                        }, new gmaps.LatLngBounds())
                        // include current place
                        .extend(placePoint),
                    $container = $('<div></div>').appendTo(view.el);
                
                // deal with layout issues - div must be visible in DOM before map initialization
                setTimeout(function() {
                    // init map
                    var gmap = new gmaps.Map($container[0], {
                            center: bounds.getCenter(),
                            zoom: 4,
                            mapTypeId: gmaps.MapTypeId.TERRAIN,
                            streetViewControl: false,
                            styles: mapStyle
                        }),
                        markers = view.markers = [];
                    
                    // set bounds
                    gmap.fitBounds(bounds);
                    
                    function addMarker(place, opts) {
                        opts = opts || {};
                        var theme = colorScale(place.get('frequency')),
                            w = 18,
                            c = w/2,
                            size = new gmaps.Size(w, w),
                            anchor = new gmaps.Point(c, c);
                            
                        title = opts.title || place.get('title');
                        icon = opts.icon || TimeMapTheme.getCircleUrl(w, theme.color, '99');
                        
                        // add marker
                        var mopts = 
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
                            title: title,
                            clickable: !opts.noclick,
                            zIndex: opts.zIndex
                        });
                        
                        if (!opts.noclick) {
                            // UI listener
                            gmaps.event.addListener(marker, 'click', function() {
                                state.set({ placeid: place.id });
                            });
                        }
                        
                        markers.push(marker);
                    }
                    
                    // add markers for current place
                    addMarker(place, { 
                        icon: 'images/star.png',
                        noclick: true,
                        zIndex: 1000
                    });
                    
                    // add markers and lines for related places
                    related.forEach(function(r) {
                        // add polyline
                        new gmaps.Polyline({
                            path: [placePoint, r.place.gmapLatLng()],
                            map: gmap,
                            clickable: false,
                            geodesic: true,
                            strokeColor: 'steelblue',
                            strokeOpacity: .7,
                            strokeWeight: strokeScale(r.count)
                        });
                        // add marker
                        addMarker(r.place, {
                            title: r.place.get('title') + ': ' + 
                                r.count + ' co-reference' + 
                                (r.count > 1 ? 's' : '')
                        });
                    });
                }, 0);
            });
            
        }
    });
    
});