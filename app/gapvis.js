/*!
 * Copyright (c) 2011, Nick Rabinowitz / Google Ancient Places Project
 * Licensed under the BSD License (see LICENSE.txt)
 */

/**
 * @namespace
 * Top-level namespace for the GapVis application
 */
var gv = (function(window) {
    var API_ROOT = 'stub_api';

    // namespace within the anonymous function
    var gv = {},
        Backbone = window.Backbone,
        ctrl;
        
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
        state,
        Place, PlaceList, Page, PageList, Book, BookList;
        
    
    // state holds non-routed state, e.g. map state
    state = new Backbone.Model(),
        
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
            }
        }),
        BookListView, IndexView, 
        BookView, BookTitleView, TimemapView;
    
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
    
    // View: BookListView (item in book index)
    BookListView = View.extend({
        tagName: 'li',
        
        events: {
            "click": "openBook"
        },
        
        render: function() {
            $(this.el).html(this.model.get('title'));
            return this;
        },
        
        openBook: function() {
            ctrl.navigate('book/' + this.model.id, true);
        }
    });
    
    // View: BookView (master view for the book screen)
    BookView = View.extend({
        el: '#book-view',
        
        events: {
            'click #nextlink.on':   'nextPage',
            'click #prevlink.on':   'prevPage'
        },
        
        initialize: function(opts) {
            var view = this,
                book = this.model = new Book({ id: opts.bookId });
            book.fetch({ 
                success: function() {
                    book.initCollections();
                    view.initViews().render();
                },
                error: function() {
                    console.log('Error fetching book ' + book.id)
                }
            });
        },
        
        initViews: function() {
            var book = this.model;
            this.titleView = new BookTitleView({ model: book });
            this.timemapView = new TimemapView({ model: book });
            return this;
        },
        
        render: function() {
            this.titleView.render();
            this.timemapView.render();
            return this;
        },
        
        renderNextPrev: function() {
            $('#prevlink').attr('class', this.prevPage ? 'on' : '');
            $('#nextlink').attr('class', this.nextPage ? 'on' : '');
        },
        
        openPage: function(pageId) {
            var view = this,
                book = view.model;
            // we're still loading, come back later
            if (!book.pages.length) {
                book.pages.bind('reset', function() { view.openPage(pageId) });
                return;
            }
            // get the relevant page
            var page = pageId && book.pages.get(pageId) || 
                book.pages.first();
            // another page is open; close it
            if (view.pageView) {
                view.pageView.close();
            }
            // page view has been created; show
            if (page.view) {
                view.pageView = page.view;
                view.page = page;
                page.view.open();
                // update next/prev links
                view.updateNextPrev();
                view.renderNextPrev();
                // update url and timeline
                ctrl.navigate('book/' + book.id + '/page/' + page.id);
                view.timemapView.scrollTo(page.id);
            } else {
                // make a new page view
                page.bind('change', function() {
                    $('#page-view').prepend(page.view.render().el);
                    view.openPage(page.id);
                });
                view.pageView = new PageView({ model: page });
            }
        },
        
        updateNextPrev: function() {
            var pages = this.model.pages,
                idx = pages.indexOf(this.page);
            this.prevPage = pages.at(idx-1);
            this.nextPage = pages.at(idx+1);
        },
        
        nextPage: function() {
            this.openPage(this.nextPage);
        },
        
        prevPage: function() {
            this.openPage(this.prevPage);
        },
        
        clear: function() {
            $(this.el).empty();
        }
    });
    
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
    
    // View: PageView (title and metadata)
    PageView = View.extend({
        tagName: 'div',
        className: 'page-view',
        
        initialize: function() {
            var view = this,
                page = view.model;
            view.template = _.template($('#page-template').html());
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
            $(this.el)
                .html(this.template(this.model.toJSON()));
            return this;
        }
    });
    
    // View: TimemapView
    TimemapView = View.extend({
        el: '#timemap-view',
        
        initialize: function() {
            this.template = $('#timemap-template').html();
        },
        
        render: function() {
            $(this.el).html(this.template);
            
            var book = this.model,
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
                labelUtils = this.labelUtils = new LabelUtils(
                    bandInfo, book.labels(), function() { return false; }
                );
            
            var tm = this.tm = TimeMap.init({
                mapId: "map",
                timelineId: "timeline",
                options: {
                    eventIconPath: "images/",
                    openInfoWindow: function() {
                        console.log(this);
                        ctrl.navigate('book/' + book.id + '/page/' + this.opts.page.id, true);
                        TimeMapItem.openInfoWindowBasic.call(this);
                    }
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
                bands: bandInfo
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
            var d = this.labelUtils.labelToDate(pageId);
            // XXX: might do something to fix the jumping for repeated clicks
            this.tm.scrollToDate(d, false, true);
        }
    });
    
    //---------------------------------------
    // Controller
    //---------------------------------------
    
    var Ctrl = Backbone.Router.extend({
    
        initialize: function() {
            this._viewCache = {};
        },

        routes: {
            "":                     "index",
            "book/:bid":            "book",
            "book/:bid/page/:pid":  "book",
        },
        
        // function to cache and retrieve views
        cache: function(k, view) {
            if (view) {
                this._viewCache[k] = view;
            } 
            return this._viewCache[k];
        },
        
        index: function() {
            var view = this.cache('index') || 
                this.cache('index', new IndexView());
            this.open(view);
        },
        
        book: function(bid, pid) {
            // get state vars if any
            bid = this.parseState(bid);
            // XXX: depends on how API delivers ids
            bid = parseInt(bid);
            // get view
            var view = this.cache('book-' + bid) || 
                this.cache('book-' + bid, new BookView({ bookId: bid }));
            this.open(view);
            // set current page
            pid = pid && parseInt(pid); // XXX: depends on how API delivers ids
            view.openPage(pid);
        },
        
        // strip and set any global state variables
        parseState: function(param) {
            var parts = param.split('?'),
                param = parts[0],
                qs = parts[1];
            if (qs) {
                // XXX: parse the querystring and set the values 
                // in the state object
            }
            return param;
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
    
    gv.init = function() {
        ctrl = gv.ctrl = new Ctrl();
        Backbone.history.start();
    }
    
    return gv;
}(window));

// kick things off
$(gv.init);

// Throws an annoying error otherwise
SimileAjax.History.enabled = false;