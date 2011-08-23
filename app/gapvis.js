/*!
 * Copyright (c) 2011, Nick Rabinowitz / Google Ancient Places Project
 * Licensed under the BSD License (see LICENSE.txt)
 */
 
/*
 Basic architecture:
 - Models are responsible for getting book data from API
 - Singleton state model is responsible for ui state data
 - Views are responsible for:
    initialize:
    - instantiating/fetching their models if necessary
    - instantiating sub-views
    - listening for state changes
    - listening for model changes
    events:
    - listening for ui events, updating state
    ui methods:
    - updating ui on state change
    - updating ui on model change
 - Singleton router is responsible for:
    - setting state depending on route
    - setting route depending on state
*/

/**
 * @namespace
 * Top-level namespace for the GapVis application
 */
var gv = (function(window) {
    var API_ROOT = 'stub_api';

    // namespace within the anonymous function
    var gv = {},
        Backbone = window.Backbone;
        
    //---------------------------------------
    // Models
    //---------------------------------------
    
    // set up default model
    var Model = Backbone.Model.extend({
        
            // add .json to url
            url: function() {
                return Backbone.Model.prototype.url.call(this) + '.json'
            },
            
            // remove save/destroy
            save: $.noop,
            destroy: $.noop
            
        }),
        Collection = Backbone.Collection,
        State, state,
        tmParams = TimeMap.state.params,
        Place, PlaceList, 
        Page, PageList, 
        Book, BookList;
        
    
    //---------------------------------------
    // State model
    
    // model to hold current state
    State = Backbone.Model.extend({
        deserialize: function(key, value) {
            var params = this.params,
                f = params[key] && params[key].deserialize || _.identity;
            return f(value);
        },
        serialize: function(key, value) {
            var params = this.params,
                f = params[key] && params[key].serialize || _.identity;
            return f(value);
        },
        // convenience function to set a serialized value
        setSerialized: function(key, value) {
            o = {};
            o[key] = this.deserialize(key, value);
            this.set(o);
        },
        // factory for de/serializable state parameters
        param: function(deserialize, serialize) {
            return {
                deserialize: deserialize || _.identity,
                serialize: serialize || _.identity
            };
        }
    });
    // create a singleton instance
    state = new State({
        pageview: 'text'
    });
    state.params = {
        bookid: state.param(parseInt),
        pageid: state.param(parseInt),
        placeid: state.param(parseInt),
        mapzoom: state.param(parseInt),
        mapcenter: state.param(tmParams.center.fromString, tmParams.center.toString)
    };
        
    // Model: Place
    Place = Model.extend({
        defaults: {
            title: "Untitled Place"
        }
    });
    
    // Model: Page
    Page = Model.extend({
        initialize: function() {
            this.set({
                title:'Page ' + this.id
            });
            // XXX: should I map place ids to real Places?
        }
    });
    
    // Model: Book
    Book = Model.extend({
        defaults: {
            title: "Untitled Book"
        },
        
        url: function() {
            return API_ROOT + '/book/' + this.id + '/full.json';
        },
        
        initialize: function() {
            var book = this,
                // create collections
                places = book.places = new PlaceList(),
                pages = book.pages = new PageList();
            places.book = book;
            book.pages.book = book;
        },
        
        // reset collections with current data
        initCollections: function() {
            this.places.reset(this.get('places'));
            this.pages.reset(this.get('pages'));
        },
        
        // array of page labels for timemap
        labels: function() {
            return this.pages.map(function(p) { return p.id });
        },
        
        // array of items for timemap
        timemapItems: function() {
            var book = this,
                items = [];
            this.pages.each(function(page) {
                var places = page.get('places') || [];
                places.forEach(function(placeId) {
                    var place = book.places.get(placeId),
                        ll = place.get('ll');
                    items.push({
                        title: place.get('title'),
                        point: {
                            lat: ll[0],
                            lon: ll[1]
                        },
                        options: {
                            place: place,
                            page: page
                        }
                    });
                });
            });
            return items;
        },
        
        // next/prev ids
        nextPrevId: function(pageId, prev) {
            var pages = this.pages,
                currPage = pages.get(pageId),
                idx = currPage ? pages.indexOf(currPage) + (prev ? -1 : 1) : -1,
                page = pages.at(idx)
            return page && page.id;
        },
        
        // next page id
        nextId: function(pageId) {
            return this.nextPrevId(pageId);
        },
        
        // previous page id
        prevId: function(pageId) {
            return this.nextPrevId(pageId, true);
        },
        
        // first page id
        firstId: function() {
            var first = this.pages.first()
            return first && first.id;
        },
        
        // next/prev place references
        nextPrevPlaceRef: function(pageId, placeId, prev) {
            var pages = this.pages,
                currPage = pages.get(pageId);
            if (currPage) {
                var idx = pages.indexOf(currPage),
                    test = function(page) {
                        var places = page.get('places');
                        return places && places.indexOf(placeId) >= 0;
                    },
                    increment = function() { idx += (prev ? -1 : 1); return idx };
                while (currPage = pages.at(increment(idx))) {
                    if (test(currPage)) {
                        return currPage.id;
                    }
                }
            }
        },
        
        // next page id
        nextPlaceRef: function(pageId, placeId) {
            return this.nextPrevPlaceRef(pageId, placeId);
        },
        
        // previous page id
        prevPlaceRef: function(pageId, placeId) {
            return this.nextPrevPlaceRef(pageId, placeId, true);
        }
    });
    
    // Collection: PlaceList
    PlaceList = Collection.extend({
        model: Place,
        url: API_ROOT + '/place'
    });
    
    // Collection: PageList
    PageList = Collection.extend({
        model: Page,
        url: function() {
            return API_ROOT +  '/book/' + this.book.id + '/page';
        }
    });
    
    // Collection: BookList
    BookList = Collection.extend({
        model: Book,
        url: API_ROOT +  '/books.json'
    });
    
    //---------------------------------------
    // Views
    //---------------------------------------
    
    // default view
    var View = Backbone.View.extend({
            open: function() {
                $(this.el).show();
            },
            close: function() {
                $(this.el).hide();
            },
            clear: function() {
                $(this.el).empty();
            }
        }),
        BookListView, IndexView, 
        BookView, PageNavView, BookTitleView, 
        InfoWindowView, TimemapView, PageControlView,
        AppView;
        
    //---------------------------------------
    // Index Views
    
    // View: IndexView (index page)
    IndexView = View.extend({
        el: '#index-view',
        
        initialize: function() {
            var books = this.model = new BookList();
            books.bind('reset', this.addList, this);
            books.fetch();
        },
        
        addList: function() {
            this.model.forEach(function(book) {
                var view = new BookListView({ model:book });
                this.$("#book-list").append(view.render().el);
            })
        }
    });
    IndexView.key = 'index';
    
    // View: BookListView (item in book index)
    BookListView = View.extend({
        tagName: 'li',
        
        render: function() {
            $(this.el).html(this.model.get('title'));
            return this;
        },
        
        events: {
            "click": "uiOpenBook"
        },
        
        uiOpenBook: function() {
            state.set({ 'bookid': this.model.id });
            state.set({ 'topview': BookView });
        }
    });
    
    //---------------------------------------
    // Book Views
    
    // View: BookTitleView (title and metadata)
    BookTitleView = View.extend({
        el: '#book-title-view',
        
        initialize: function() {
            this.template = _.template($('#book-title-template').html())
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });
    
    // View: PageNavView (little thumbnails)
    PageNavView = View.extend({
        el: '#page-nav-view',
        
        initialize: function() {
            // listen for state changes
            state.bind('change:pageid', this.renderCurrentPage, this);
            state.bind('change:placeid', this.renderSelectedPlace, this);
        },
        
        render: function() {
            var book = this.model;
            // we're still loading, come back later
            if (!book.pages.length) {
                book.pages.bind('reset', this.render, this);
                return;
            }
            
            var data = book.pages.models,
                h = 40,
                ratio = 3/4,
                spacing = 5,
                pages = data.length,
                w = $('#book-view').width() - 40,
                ph = h - spacing,
                pw = ph * ratio,
                rows = 1, cols;
            while ((pw + spacing) * pages / rows > w) {
                h *= 1.2;
                rows++;
                ph = ((h - spacing * rows) / rows);
                pw = ph * ratio;
            }
            cols = ~~(w / (pw + spacing));
            // make nav
            d3.select(this.el)
                .style('height', h + 'px')
              .selectAll('div')
                .data(data)
              .enter().append('div')
                .style('width', pw + 'px')
                .style('height', ph + 'px');
            
            this.renderCurrentPage();
            this.renderSelectedPlace();
        },
        
        renderCurrentPage: function() {
            var pageId = state.get('pageid');
            d3.select(this.el)
              .selectAll('div')
                .classed('current', function(d) { return d.id == pageId });
        },
        
        renderSelectedPlace: function() {
            var placeId = state.get('placeid');
            d3.select(this.el)
              .selectAll('div')
                .classed('haspoi', function(d) {
                    var places = d.get('places');
                    return places && places.indexOf(placeId) >= 0; 
                });
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click div':    'uiOpenPage'
        },
        
        uiOpenPage: function(e) {
            // this is a little ugly - better to use d3's machinery?
            var pageId = e.target.__data__.id;
            state.set({ pageid: pageId });
        }
    });
    
    // View: PageControlView (control buttons)
    PageControlView = View.extend({
        el: '#page-control-view',
        
        initialize: function(opts) {
            // listen for state changes
            state.bind('change:pageid', this.renderNextPrev, this);
            state.bind('change:pageview', this.renderPageView, this);
        },
        
        render: function() {
            this.renderNextPrev();
            this.renderPageView();
        },
        
        renderNextPrev: function() {
            // update next/prev
            var book = this.model,
                pageId = state.get('pageid') || book.firstId();
            this.prev = book.prevId(pageId);
            this.next = book.nextId(pageId);
            // render
            $('#prev').toggleClass('on', !!this.prev);
            $('#next').toggleClass('on', !!this.next);
        },
        
        renderPageView: function() {
            var pageView = state.get('pageview');
            // render
            $('#showimg').toggleClass('on', pageView == 'text');
            $('#showtext').toggleClass('on', pageView == 'image');
        },
        
        clear: function() {
            $('#prev, #next').removeClass('on');
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click #next.on':       'uiNext',
            'click #prev.on':       'uiPrev',
            'click #showimg.on':    'uiShowImage',
            'click #showtext.on':   'uiShowText'
        },
        
        uiNext: function() {
            state.set({ pageid: this.next });
        },
        
        uiPrev: function() {
            state.set({ pageid: this.prev });
        },
        
        uiShowImage: function() {
            state.set({ pageview:'image' })
        },
        
        uiShowText: function() {
            state.set({ pageview:'text' })
        }
    });
    
    // View: PageView (title and metadata)
    PageView = View.extend({
        tagName: 'div',
        className: 'page-view',
        
        initialize: function() {
            var view = this,
                page = view.model;
            view.template = _.template($('#page-template').html());
            // listen for state changes
            state.bind('change:pageview', this.renderPageView, this);
            state.bind('change:placeid', this.renderPlaceHighlight, this);
            // set backreference
            page.view = view;
            // load page
            page.fetch({
                success: function() {
                    view.render();
                },
                error: function() {
                    console.log('Error fetching page ' + view.model.id)
                }
            });
        },
        
        render: function() {
            var view = this;
            $(view.el)
                .html(view.template(view.model.toJSON()));
            view.renderPageView();
            view.renderPlaceHighlight();
            return view;
        },
        
        renderPageView: function() {
            var pageView = state.get('pageview');
            // render
            this.$('.ocr').toggle(pageView == 'text');
            this.$('.img').toggle(pageView == 'image');
        },
        
        renderPlaceHighlight: function() {
            var placeId = state.get('placeid');
            // render
            this.$('span.place').each(function() {
                $(this).toggleClass('hi', $(this).attr('data-place-id') == placeId);
            });
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .place':    'uiPlaceClick'
        },
        
        uiPlaceClick: function(e) {
            var placeId = $(e.target).attr('data-place-id');
            if (placeId) {
                state.setSerialized('placeid', placeId);
            }
        },
        
    });
    
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
                place.bind('change', this.render, this);
                place.fetch();
            } else {
                // create content
                $(this.el).html(this.template(place.toJSON()));
                this.renderZoomControl();
                this.renderNextPrevControl();
                // open bubble
                map.openBubble(this.getPoint(), this.el);
                map.closeInfoBubble.addHandler(function() {
                    if (state.get('placeid') == placeId) {
                        state.unset('placeid');
                    }
                })
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
                // create band info
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
                    eventIconPath: "images/",
                    openInfoWindow: openPlaceWindow,
                    closeInfoWindow: $.noop,
                    mapCenter: mapCenter,
                    mapZoom: mapZoom,
                    centerOnItems: centerOnItems
                },
                datasets: [
                    {
                        id: "places",
                        theme: "blue",
                        type: "basic",
                        options: {
                            items: book.timemapItems(),
                            transformFunction: function(item) {
                                item.start = labelUtils.getLabelIndex(item.options.page.id) + ' AD';
                                return item;
                            }
                        }
                    }
                ],
                bands: bandInfo
            });
            // the load is synchronous, so we have to call after TimeMap.init()
            view.updateTimeline();
            
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
            
            // set up fade filter
            tm.addFilter("map", function(item) {
                var topband = tm.timeline.getBand(0),
                    maxVisibleDate = topband.getMaxVisibleDate().getTime(),
                    minVisibleDate = topband.getMinVisibleDate().getTime(),
                    images = ['blue-100.png', 'blue-80.png', 'blue-60.png', 'blue-40.png', 'blue-20.png'],
                    pos = Math.floor(
                        (maxVisibleDate - item.getStartTime()) / (maxVisibleDate - minVisibleDate)
                        * images.length
                    );
                // set image according to timeline position
                if (pos >= 0 && pos < images.length) {
                    item.getNativePlacemark().setIcon("images/" + images[pos]);
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
    
    // View: BookView (master view for the book screen)
    BookView = View.extend({
        el: '#book-view',
        
        initialize: function(opts) {
            var view = this;
            // listen for state changes
            state.bind('change:bookid', function() {
                view.clear();
                view.updateBook();
            });
            state.bind('change:pageid', view.updatePage, view);
            // instantiate book
            this.updateBook();
        },
        
        childViews: [
            BookTitleView,
            TimemapView,
            PageControlView
            // PageNavView
        ],
        
        updateViews: function() {
            var view = this,
                book = view.model;
            view.children = view.childViews.map(function(cls) {
                return new cls({ 
                    model: book,
                    parent: view
                })
            });
            return view;
        },
        
        // Render functions
        
        render: function() {
            // render all children
            this.children.forEach(function(child) {
                child.render();
            });
            return this;
        },
        
        clear: function() {
            // delete contents of all children
            view.children.forEach(function(child) {
                child.clear();
            });
            $('page-view').empty();
        },
        
        // Model update functions
        
        updateBook: function() {
            var view = this,
                book = view.model = new Book({ id: state.get('bookid') });
            book.fetch({ 
                success: function() {
                    book.initCollections();
                    if (!state.get('pageid')) {
                        state.set({ pageid: book.firstId() });
                    }
                    view.updateViews().render();
                    view.updatePage();
                },
                error: function() {
                    console.log('Error fetching book ' + book.id)
                }
            });
        },
        
        updatePage: function() {
            var view = this,
                book = view.model,
                pageId = state.get('pageid');
            // we're still loading, come back later
            if (!book.pages.length) {
                book.pages.bind('reset', view.openPage, view);
                return;
            }
            // get the relevant page
            var page = pageId && book.pages.get(pageId) || 
                book.pages.first();
            // another page is open; close it
            if (view.pageView) {
                view.pageView.close();
            }
            // make a new page view if necessary
            if (!page.view) {
                page.bind('change', function() {
                    $('#page-view').append(page.view.render().el);
                    view.updatePage();
                });
                new PageView({ model: page });
            } 
            // page view has been created; show
            else {
                view.pageView = page.view;
                page.view.open();
            }
        }
        
    });
    BookView.key = 'book';
    
    //---------------------------------------
    // App View
        
    // View: AppView (master view)
    AppView = View.extend({
    
        initialize: function() {
            this._viewCache = {};
            // listen for state changes
            state.bind('change:topview', this.updateView, this);
            state.bind('change:mapzoom', this.updatePermalink, this);
            state.bind('change:mapcenter', this.updatePermalink, this);
        },
        
        // function to cache and retrieve views
        cache: function(k, view) {
            if (view) {
                this._viewCache[k] = view;
            } 
            return this._viewCache[k];
        },
        
        // update the top-level view
        updateView: function() {
            var cls = state.get('topview'),
                key = cls.key,
                view = this.cache(key) || this.cache(key, new cls());
            this.open(view)
        },
        
        updatePermalink: function() {
            var router = this.options.router;
            $('#permalink').attr('href', router.getPermalink());
        },
        
        // close the current view and open a new one
        open: function(view) {
            if (view) {
                var oldview = this.currentView;
                if (oldview && oldview != view) {
                    oldview.close();
                }
                this.currentView = view;
                view.open();
            }
        }
    
    });
    
    //---------------------------------------
    // Router
    //---------------------------------------
    
    var AppRouter = Backbone.Router.extend({
    
        initialize: function() {
            // listen for state changes
            var router = this,
                f = function() { router.updateRoute() };
            state.bind('change:topview',    f);
            state.bind('change:bookid',     f);
            state.bind('change:pageid',     f);
            state.bind('change:placeid',    f);
        },

        routes: {
            "":                                 "index",
            "book/:bookid":                     "book",
            "book/:bookid/:pageid":             "book",
            "book/:bookid/:pageid/:placeid":    "book"
        },
        
        index: function() {
            // update view
            state.set({ topview: IndexView });
        },
        
        book: function(bookId, pageId, placeId) {
            // look for querystring. XXX: not thrilled with doing this here.
            bookId = this.parseQS(bookId);
            pageId = this.parseQS(pageId);
            placeId = this.parseQS(placeId);
            // update parameters
            state.setSerialized('bookid', bookId);
            state.setSerialized('pageid', pageId);
            state.setSerialized('placeid', placeId);
            // update view
            state.set({ topview: BookView });
        },
        
        // list of parameters to de/serialize in the querystring
        qsParams: ['mapzoom', 'mapcenter'],
        
        // strip and set any global state variables from the querystring
        parseQS: function(value) {
            if (value) {
                var parts = value.split('?'),
                    qs = parts[1];
                if (qs) {
                    qs.split('&').forEach(function(pair) {
                        var kv = pair.split('='),
                            val = kv[1] ? decodeURIComponent(kv[1]) : null;
                        if (kv.length > 1) {
                            state.setSerialized(kv[0], val);
                        }
                    });
                }
                return parts[0];
            }
        },
        
        getRoute: function() {
            var topview = state.get('topview'),
                // this is effectively the index view
                route = '';
            // create book view route
            if (topview == BookView){
                route = 'book/' + state.get('bookid') + 
                        (state.get('pageid') ? '/' + state.get('pageid') +
                            (state.get('placeid') ? '/' + state.get('placeid') : '')
                        : '');
            }
            return route;
        },
        
        // encode a querystring from state parameters
        getQS: function() {
            var qs = this.qsParams.map(function(key) {
                    var value = state.get(key),
                        fragment = '';
                    if (value) {
                        fragment = key + '=' + encodeURI(state.serialize(key, value));
                    }
                    return fragment;
                }).filter(_.identity).join('&');
            return qs ? '?' + qs : '';
        },
        
        // the full link, with querystring in state
        getPermalink: function() {
            return window.location.href + this.getQS();
        },
        
        // update the url based on the current state
        updateRoute: function() {
            this.navigate(this.getRoute());
        }

    });
    
    gv.init = function() {
        gv.state = state;
        gv.router = new AppRouter();
        gv.app = new AppView({ 
            router: gv.router
        });
        Backbone.history.start();
    };
    
    return gv;
}(window));

// kick things off
$(gv.init);


//-----------------------------------
// Monkey patches :(

// Throws an annoying error otherwise
SimileAjax.History.enabled = false;

// allow animations to be stopped
SimileAjax.Graphics._Animation.prototype.run = function() {
    var a = this;
    a.timeoutId = window.setTimeout(function() { a.step(); }, 50);
};
SimileAjax.Graphics._Animation.prototype.stop = function() {
    window.clearTimeout(this.timeoutId);
};

mxn.LatLonPoint.prototype.roughlyEquals = function(otherPoint, zoom) {
    function roughly(f) {
        return f.toFixed(~~(zoom/2))
    }
    return roughly(this.lat) == roughly(otherPoint.lat) 
        && roughly(this.lon)== roughly(otherPoint.lon);
};