/*
 * TimeMap View
 */
define(['gv', 'views/BookView', 'views/InfoWindowView'], function(gv, BookView, InfoWindowView) {
    var state = gv.state,
        settings = gv.settings,
        // map styles
        mapStyle = settings.mapStyle,
        scaleColors = settings.scaleColors,
        colorThemes = settings.colorThemes,
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
        ];
    
    // View: TimemapView
    return BookView.extend({
        className: 'timemap-view panel fill',
        template: '#timemap-template',
        
        initialize: function() {
            var view = this;
            view.infoWindowView = new InfoWindowView({ model: view.model });
            // listen for state changes
            view.bindState('change:pageid',     view.updateTimeline, view);
            view.bindState('change:mapzoom',    view.updateMapZoom, view);
            view.bindState('change:mapcenter',  view.updateMapCenter, view);
            view.bindState('change:maptypeid',  view.updateMapTypeId, view);
            view.bindState('change:autoplay',   view.updateAutoplay, view);
            view.bindState('change:autoplay',   view.renderAutoplayControls, view);
            // cancel autoplay on other UI events
            view.bindState('change:topview',    view.stopAutoplay, view);
            view.bindState('change:placeid',    view.stopAutoplay, view);
            view.bindState('change:pageid',     view.stopAutoplay, view);
        },
        
        clear: function() {
            this.infoWindowView.clear();
            BookView.prototype.clear.call(this);
        },
        
        render: function() {
            var view = this,
                book = view.model,
                // create themes by frequency
                colorScale = d3.scale.quantize()
                    .domain([1, book.places.first().get('frequency')])
                    .range(colorThemes),
                // add custom labeller
                labelUtils = view.labelUtils = new LabelUtils(
                    bandInfo, book.labels(), function() { return false; }
                );
            
            // render template HTML
            view.$el.html(view.template);
            
            // custom info window function
            function openPlaceWindow() {
                var item = this,
                    opts = item.opts;
                // ugh - order matters here
                state.set({ pageid: opts.page.id });
                state.set({ placeid: opts.place.id });
            }
            
            // create a new loader class for progressive loading of in-memory items
            function InMemoryProgressiveLoader(options) {
                var loader = new TimeMap.loaders.basic(options),
                    baseLoadFunction = loader.load;
                // this is a little circuitous, but works with the existing prog loader
                loader.opts = { url: [] };
                loader.load = function(dataset, callback) {
                    // loader.opts.url has been set to [startId, endId] by prog loader
                    var ids = loader.opts.url;
                    loader.data = book.timemapItems(ids[0], ids[1]);
                    baseLoadFunction.call(loader, dataset, callback);
                }
                return loader;
            }
            function implFormatUrl(url, start, end) {
                return [
                    labelUtils.dateToLabel(start),
                    labelUtils.dateToLabel(end)
                ];
            }
            
            // set center and zoom if available
            var mapCenter = state.get('mapcenter'),
                mapZoom = state.get('mapzoom'),
                mapBounds = !(mapCenter && mapZoom) ? book.gmapBounds() : null;
            
            // this is an admittedly ugly way to init the timemap after its container
            // has been added to the DOM
            setTimeout(function() {
            
                var tm = view.tm = TimeMap.init({
                    mapSelector: view.$(".map"),
                    timelineSelector: view.$(".timeline"),
                    options: {
                        openInfoWindow: openPlaceWindow,
                        closeInfoWindow: $.noop,
                        mapCenter: mapCenter,
                        mapZoom: mapZoom,
                        centerOnItems: false
                    },
                    datasets: [
                        {
                            id: "places",
                            theme: TimeMapTheme.createCircleTheme(),
                            type: "progressive",
                            type: "progressive",
                            options: {
                                start: labelUtils.getStartDate(),
                                // cutoff dates for data
                                dataMinDate: labelUtils.getStartDate(),
                                dataMaxDate: labelUtils.getEndDate(),
                                // 30 yrs in milliseconds
                                interval: 946684806845,   
                                // function to turn date into string appropriate for service
                                formatUrl: implFormatUrl,
                                // custom loader
                                loader: new InMemoryProgressiveLoader({
                                    // standard loader options
                                    transformFunction: function(item) {
                                        var theme = colorScale(item.options.place.get('frequency')),
                                            opts = item.options,
                                            size = 18,
                                            color = theme.color,
                                            gmaps = google.maps;
                                        // set start
                                        item.start = labelUtils.getLabelIndex(item.options.page.id) + ' AD';
                                        // set theme
                                        opts.theme = theme;
                                        // set marker images
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
                                        return item;
                                    }
                                })
                            }
                        }
                    ],
                    bands: bandInfo
                });
                
                // the load is synchronous, so we have to call after TimeMap.init()
                view.scrollTo(state.get('pageid') || view.model.firstId());
                view.updateMapTypeId();
                
                // set the map to our custom style
                var gmap = tm.getNativeMap();
                gmap.setOptions({
                    styles: mapStyle
                });
                
                // set bounds if necessary
                if (mapBounds) {
                    gmap.fitBounds(mapBounds);
                }
                
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
                // have to do this with the native map
                var gmap = tm.getNativeMap();
                google.maps.event.addListener(gmap, 'maptypeid_changed', function() {
                    state.set({ maptypeid: gmap.getMapTypeId() });
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
                tm.timeline.layout();
            
            }, 0);
            
            return this;
        },
        
        renderAutoplayControls: function() {
            var playing = state.get('autoplay');
            // render
            this.$('.timeline-play').toggleClass('on', !playing);
            this.$('.timeline-stop').toggleClass('on', playing);
        },
        
        // UI update functions
        
        updateTimeline: function() {
            var view = this,
                animate = !(state.get('scrolljump'));
            view.scrollTo(state.get('pageid') || view.model.firstId(), animate);
            state.unset('scrolljump');
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
        
        updateMapTypeId: function() {
            var map = this.tm.getNativeMap(),
                typeId = state.get('maptypeid');
            if (typeId) {
                map.setMapTypeId(typeId);
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
        scrollTo: function(pageId, animate) {
            var view = this,
                d = view.labelUtils.labelToDate(pageId);
            // stop anything that's running
            if (view.animation) {
                view.animation.stop();
            }
            if (animate) {
                // insert our variable into the closure. Ugly? Very.
                SimileAjax.Graphics.createAnimation = function(f, from, to, duration, cont) {
                    view.animation = new SimileAjax.Graphics._Animation(f, from, to, duration, function() {
                        view.animation = null;
                    });
                    return view.animation;
                };
                // run
                view.tm.scrollToDate(d, false, true);
            } else {
                view.tm.scrollToDate(d);
            }
        },
        
        // UI Event Handlers
        
        events: {
            'click .timeline-play': 'startAutoplay',
            'click .timeline-stop': 'stopAutoplay'
        },
        
        startAutoplay: function() {
            state.set({ autoplay: true });
        },
        
        stopAutoplay: function() {
            state.set({ autoplay: false });
        }
    });
    
});