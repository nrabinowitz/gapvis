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
        Param, state,
        tmParams = TimeMap.state.params,
        Place, PlaceList, 
        Page, PageList, 
        Book, BookList;
    
    // factory for de/serializable state parameters
    function param(deserialize, serialize) {
        return {
            deserialize: deserialize || _.identity,
            serialize: serialize || _.identity
        }
    }
    
    // model to hold current state, with defaults
    state = new Backbone.Model({
        pageview: 'text'
    });
    state.params = {
        bookid: param(parseInt),
        pageid: param(parseInt),
        mapcenter: param(tmParams.center.fromString, tmParams.center.toString),
        mapzoom: param(parseInt),
        mapitem: param(tmParams.selected.fromString, tmParams.selected.toString)
    };
        
    // Model: Place
    Place = Model.extend({
        defaults: {
            title: "Untitled Place"
        },
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
        BookView, BookTitleView, InfoWindowView, TimemapView, PageControlView,
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
            return view;
        },
        
        renderPageView: function() {
            var pageView = state.get('pageview');
            // render
            this.$('.ocr').toggle(pageView == 'text');
            this.$('.img').toggle(pageView == 'image');
        }
    });
    
    // View: InfoWindowView (content for the map infowindow)
    InfoWindowView = View.extend({
        tagName: 'div',
        className: 'infowindow',
        
        initialize: function(opts) {
            this.template = _.template($('#info-window-template').html());
            // listen for state changes
            state.bind('change:mapzoom', this.updateZoomControl, this);
        },
        
        // render and update functions
        
        render: function() {
            var place = this.model;
            // XXX: better flag here?
            if (!place.get('uri')) {
                place.bind('change', this.render, this);
                place.fetch();
            } else {
                var context = _.extend(place.toJSON(), { page: this.options.page.id});
                $(this.el).html(this.template(context));
                this.updateZoomControl();
            }
            return this;
        },
        
        updateZoomControl: function() {
            this.$('.zoom').toggleClass('on', state.get('mapzoom') < 12);
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.zoom': 'uiZoom'
        },
        
        uiZoom: function() {
            var zoom = state.get('mapzoom');
            zoom = Math.min(zoom+2, 12);
            state.set({ 
                mapzoom: zoom, 
                mapcenter: this.options.point
            });
        }
    });
    
    // View: TimemapView
    TimemapView = View.extend({
        el: '#timemap-view',
        
        initialize: function() {
            var view = this;
            view.template = $('#timemap-template').html();
            // listen for state changes
            state.bind('change:pageid', this.updateTimeline, this);
            state.bind('change:mapzoom', this.updateMapZoom, this);
            state.bind('change:mapcenter', this.updateMapCenter, this);
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
                state.set({ mapitem: this });
                state.set({ pageid: this.opts.page.id });
                // create info window view if necessary
                var opts = this.opts;
                if (!this.infoView) {
                    this.infoView = new InfoWindowView({
                        model: opts.place,
                        page: opts.page,
                        point: this.getInfoPoint()
                    });
                    opts.infoHtml = this.infoView.render().el;
                }
                TimeMapItem.openInfoWindowBasic.call(this);
            }
            
            // set center and zoom if available
            var mapCenter = state.get('mapcenter'),
                mapZoom = state.get('mapzoom'),
                centerOnItems = !(mapCenter && mapZoom);
            
            var tm = view.tm = TimeMap.init({
                mapId: "map",
                timelineId: "timeline",
                options: {
                    eventIconPath: "images/",
                    openInfoWindow: openPlaceWindow,
                    mapCenter: mapCenter,
                    mapZoom: mapZoom,
                    centerOnItems: centerOnItems
                },
                datasets: [
                    {
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
                bands: bandInfo,
                dataDisplayedFunction: function(tm) {
                    var value = state.get('mapitem'),
                        ds = value && tm.datasets[value.dataset],
                        item;
                    if (ds) {
                        item = ds.getItems()[value.index];
                        if (item && !item.isSelected()) {
                            item.openInfoWindow();
                        }
                    }
                }
            });
            
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
            
            return this;
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
        
        
        // Timeline animation helpers
        
        // animate the timeline
        play: function() {
            if (!this._intervalId) {
                var band = this.tm.timeline.getBand(0),
                    centerDate = band.getCenterVisibleDate(),
                    dateInterval = 850000000, // trial and error
                    timeInterval = 25;

                this._intervalId = window.setInterval(function() {
                    centerDate = new Date(centerDate.getTime() + dateInterval);
                    band.setCenterVisibleDate(centerDate);
                }, timeInterval);
            }
        },
        
        // stop animation
        stop: function() {
            window.clearInterval(this._intervalId);
            this._intervalId = null;
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
            state.bind('change:topview', f);
            state.bind('change:bookid', f);
            state.bind('change:pageid', f);
        },

        routes: {
            "":                         "index",
            "book/:bid":                "book",
            "book/:bid/:pid":           "book"
        },
        
        index: function() {
            // update view
            this.setState('topview', IndexView);
        },
        
        book: function(bid, pid) {
            // look for querystring. XXX: not thrilled with doing this here.
            bid = this.parseQS(bid);
            pid = this.parseQS(pid);
            // update parameters
            this.setState('bookid', bid);
            this.setState('pageid', pid);
            // update view
            this.setState('topview', BookView);
        },
        
        // apply transform, if any, and update state
        setState: function(key, value) {
            var params = state.params,
                f = params[key] && params[key].deserialize || _.identity,
                o = {};
            o[key] = f(value);
            state.set(o);
        },
        
        // list of parameters to de/serialize in the querystring
        qsParams: ['mapzoom', 'mapcenter', 'mapitem'],
        
        // strip and set any global state variables from the querystring
        parseQS: function(value) {
            if (value) {
                var router = this,
                    parts = value.split('?'),
                    qs = parts[1];
                if (qs) {
                    qs.split('&').forEach(function(pair) {
                        var kv = pair.split('='),
                            val = kv[1] ? decodeURIComponent(kv[1]) : null;
                        if (kv.length > 1) {
                            router.setState(kv[0], val);
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
                        (state.get('pageid') ? '/' + state.get('pageid') : '');
            }
            return route;
        },
        
        // encode a querystring from state parameters
        getQS: function() {
            var params = state.params,
                qs = this.qsParams.map(function(key) {
                    var value = state.get(key),
                        qs = '';
                    if (value) {
                        f = params[key] && params[key].serialize || String;
                        qs = key + '=' + encodeURI(f(value));
                    }
                    return qs;
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