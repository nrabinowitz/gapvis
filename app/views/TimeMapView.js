/*
 * TimeMap View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        InfoWindowView, TimemapView,
        // map styles
        novisibility = [{ visibility: "off" }],
        mapStyle = [
            {
                elementType: "labels",
                stylers: novisibility
            },{
                featureType: "administrative",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "road",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "transit",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "poi",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "water",
                stylers: [
                    { hue: "#0033ff" },
                    { saturation: 82 },
                    { lightness: 85 }
                ]
            },{
                featureType: "landscape",
                stylers: [
                    { hue: "#80ff00" },
                    { saturation: 15 },
                    { lightness: -20 }
                ]
            }
        ],
        // band info
        bandInfo = [
            Timeline.createBandInfo({
                width:          "88%", 
                intervalUnit:   Timeline.DateTime.YEAR, 
                intervalPixels: 110,
                eventSource:    false
            }),
            Timeline.createBandInfo({
                width:          "12%", 
                intervalUnit:   Timeline.DateTime.DECADE, 
                intervalPixels: 200,
                overview:       true,
                eventSource:    false
            })
        ],
        // colors for frequency scale
        scaleColors = ["090066", "6b0051", "ce003c", "cc0020", "ee0000"];
    
    // View: InfoWindowView (content for the map infowindow)
    InfoWindowView = View.extend({
        tagName: 'div',
        className: 'infowindow',
        
        initialize: function(opts) {
            this.template = _.template($('#info-window-template').html());
            // listen for state changes
            state.bind('change:placeid', this.render, this);
            state.bind('change:pageid', this.renderNextPrevControl, this);
            state.bind('change:mapzoom', this.renderZoomControl, this);
        },
        
        // render and update functions
        
        render: function() {
            var book = this.model,
                map = this.map,
                placeId = state.get('placeid'),
                place;
            // if no map or place has been set, give up
            if (!map || !placeId) {
                return;
            }
            // get the place
            place = book.places.get(placeId);
            // if the place isn't fully loaded, do so
            // XXX: a better flag might be nice here
            if (!place.get('uri')) {
                var view = this;
                place.bind('change', function() {
                    view.render();
                });
                place.fetch();
            } else {
                // create content
                $(this.el).html(this.template(place.toJSON()));
                this.renderZoomControl();
                this.renderNextPrevControl();
                // open bubble
                map.openBubble(this.getPoint(), this.el);
                // set a handler to unset place if close is clicked
                function handler() {
                    if (state.get('placeid') == placeId) {
                        state.unset('placeid');
                    }
                    map.closeInfoBubble.removeHandler(handler);
                }
                map.closeInfoBubble.addHandler(handler);
            }
            return this;
        },
        
        renderZoomControl: function() {
            this.$('.zoom').toggleClass('on', state.get('mapzoom') < 12);
        },
        
        renderNextPrevControl: function() {
            var book = this.model,
                pageId = state.get('pageid'),
                placeId = state.get('placeid');
            this.prev = book.prevPlaceRef(pageId, placeId);
            this.next = book.nextPlaceRef(pageId, placeId);
            console.log(this.prev, this.next);
            this.$('.prev').toggleClass('on', !!this.prev);
            this.$('.next').toggleClass('on', !!this.next);
        },
        
        getPoint: function() {
            var placeId = state.get('placeid'),
                place = this.model.places.get(placeId),
                ll = place.get('ll');
            return new mxn.LatLonPoint(ll[0], ll[1]);
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.zoom.on': 'uiZoom',
            'click span.next.on': 'uiNext',
            'click span.prev.on': 'uiPrev'
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
        }
    });
    
    // View: TimemapView
    TimemapView = View.extend({
        el: '#timemap-view',
        
        initialize: function() {
            var view = this;
            view.template = $('#timemap-template').html();
            view.infoWindowView = new InfoWindowView({ model: view.model });
            // listen for state changes
            state.bind('change:pageid', this.updateTimeline, this);
            state.bind('change:mapzoom', this.updateMapZoom, this);
            state.bind('change:mapcenter', this.updateMapCenter, this);
            state.bind('change:autoplay', this.updateAutoplay, this);
            state.bind('change:autoplay', this.renderAutoplayControls, this);
            // cancel autoplay on other UI events
            state.bind('change:topview', this.stopAutoplay, this);
            state.bind('change:placeid', this.stopAutoplay, this);
            state.bind('change:pageid', this.stopAutoplay, this);
        },
        
        render: function() {
            $(this.el).html(this.template);
            
            var view = this,
                book = view.model,
                // create themes by frequency
                colorScale = d3.scale.quantize()
                    .domain([1, book.places.first().get('frequency')])
                    .range(scaleColors.map(function(color) {
                        return TimeMapTheme.createCircleTheme({ color: color })
                    })),
                // add custom labeller
                labelUtils = view.labelUtils = new LabelUtils(
                    bandInfo, book.labels(), function() { return false; }
                );
                
            // custom info window function
            function openPlaceWindow() {
                var item = this,
                    opts = item.opts;
                // ugh - order matters here
                state.set({ pageid: opts.page.id });
                state.set({ placeid: opts.place.id });
            }
            
            // set center and zoom if available
            var mapCenter = state.get('mapcenter'),
                mapZoom = state.get('mapzoom'),
                centerOnItems = !(mapCenter && mapZoom);
            
            var tm = this.tm = TimeMap.init({
                mapId: "map",
                timelineId: "timeline",
                options: {
                    openInfoWindow: openPlaceWindow,
                    closeInfoWindow: $.noop,
                    mapCenter: mapCenter,
                    mapZoom: mapZoom,
                    centerOnItems: centerOnItems
                },
                datasets: [
                    {
                        id: "places",
                        theme: TimeMapTheme.createCircleTheme(),
                        type: "basic",
                        options: {
                            items: book.timemapItems(),
                            transformFunction: function(item) {
                                item.start = labelUtils.getLabelIndex(item.options.page.id) + ' AD';
                                item.options.theme = colorScale(item.options.place.get('frequency'));
                                return item;
                            }
                        }
                    }
                ],
                bands: bandInfo
            });
            // the load is synchronous, so we have to call after TimeMap.init()
            view.updateTimeline();
            
            // set the map to our custom style
            var gmap = tm.getNativeMap();
            gmap.setOptions({
                styles: mapStyle
            });
            
            // create info window view
            view.infoWindowView.map = tm.map;
            view.infoWindowView.render();
            
            // set UI listeners for map
            tm.map.endPan.addHandler(function() {
                state.set({ mapcenter: tm.map.getCenter() })
            });
            tm.map.changeZoom.addHandler(function() {
                state.set({ mapzoom: tm.map.getZoom() })
            });
            
            // set up icon images
            tm.eachItem(function(item) {
                var opts = item.opts,
                    theme = opts.theme,
                    size = 18,
                    color = theme.color,
                    gmaps = google.maps;
                opts.markerImages = ['ff', 'cc', '99', '66', '33']
                    .map(function(alpha) {
                        var url = TimeMapTheme.getCircleUrl(size, color, alpha);
                        return new gmaps.MarkerImage(
                            url,
                            new gmaps.Size(size, size),
                            undefined,
                            new gmaps.Point(size/2, size/2)
                        );
                    });
            });
            
            // set up fade filter
            tm.addFilter("map", function(item) {
                var topband = tm.timeline.getBand(0),
                    maxVisibleDate = topband.getMaxVisibleDate().getTime(),
                    minVisibleDate = topband.getMinVisibleDate().getTime(),
                    images = item.opts.markerImages,
                    pos = Math.floor(
                        (maxVisibleDate - item.getStartTime()) / (maxVisibleDate - minVisibleDate)
                        * images.length
                    );
                // set image according to timeline position
                if (pos >= 0 && pos < images.length) {
                    item.getNativePlacemark().setIcon(images[pos]);
                }
                return true;
            });
            // run filter immediately to update images
            tm.filter('map');
            
            return this;
        },
        
        renderAutoplayControls: function() {
            var playing = state.get('autoplay');
            // render
            $('#timeline-play').toggleClass('on', !playing);
            $('#timeline-stop').toggleClass('on', playing);
        },
        
        // UI update functions
        
        updateTimeline: function() {
            var view = this;
            view.scrollTo(state.get('pageid') || view.model.firstId());
        },
        
        updateMapZoom: function() {
            var map = this.tm.map,
                zoom = state.get('mapzoom');
            // check to avoid loop
            if (map.getZoom() != zoom) {
                map.setZoom(zoom);
            }
        },
        
        updateMapCenter: function() {
            var map = this.tm.map,
                center = state.get('mapcenter');
            // check to avoid loop
            if (!map.getCenter().roughlyEquals(center, map.getZoom())) {
                map.setCenter(center);
            }
        },
        
        updateAutoplay: function() {
            var view = this,
                playing = state.get('autoplay');
            if (playing) {
                // run autoplay
                if (!this._intervalId) {
                    var band = this.tm.timeline.getBand(0),
                        centerDate = band.getCenterVisibleDate(),
                        dateInterval = 850000000, // trial and error
                        timeInterval = 25;

                    this._intervalId = window.setInterval(function() {
                        if (band.getMaxVisibleDate().getTime() < band._theme.timeline_stop.getTime()) {
                            centerDate = new Date(centerDate.getTime() + dateInterval);
                            band.setCenterVisibleDate(centerDate);
                        } else {
                            // this is because we need to reset state as well
                            view.stopAutoplay();
                        }
                    }, timeInterval);
                }
            } else {
                window.clearInterval(this._intervalId);
                this._intervalId = null;
            }
        },
        
        // go to a specific page
        scrollTo: function(pageId) {
            var view = this,
                d = this.labelUtils.labelToDate(pageId);
            // stop anything that's running
            if (view.animation) {
                view.animation.stop();
            }
            // insert our variable into the closure. Ugly? Very.
            SimileAjax.Graphics.createAnimation = function(f, from, to, duration, cont) {
                view.animation = new SimileAjax.Graphics._Animation(f, from, to, duration, function() {
                    view.animation = null;
                });
                return view.animation;
            };
            // run
            view.tm.scrollToDate(d, false, true);
        },
        
        // UI Event Handlers
        
        events: {
            'click #timeline-play': 'startAutoplay',
            'click #timeline-stop': 'stopAutoplay'
        },
        
        startAutoplay: function() {
            state.set({ autoplay: true });
        },
        
        stopAutoplay: function() {
            state.set({ autoplay: false });
        }
    });
    // register
    gv.registerChildView(gv.BookView, TimemapView);
    
}(gv));