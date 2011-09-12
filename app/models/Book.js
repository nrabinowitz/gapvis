/*
 * Page models
 */
(function(gv) {
    var Model = gv.Model,
        Collection = gv.Collection,
        API_ROOT = gv.API_ROOT,
        Book;
       
    // Model: Book
    Book = gv.Book = Model.extend({
        defaults: {
            title: "Untitled Book"
        },
        
        url: function() {
            return API_ROOT + '/book/' + this.id + '/full.json';
        },
        
        initialize: function() {
            var book = this,
                // create collections
                places = book.places = new gv.PlaceList(),
                pages = book.pages = new gv.PageList();
            // set backreferences
            places.book = book;
            pages.book = book;
        },
        
        // reset collections with current data
        initCollections: function() {
            var places = this.places,
                pages = this.pages;
            places.reset(this.get('places'));
            pages.reset(this.get('pages'));
            // calculate frequencies
            pages.each(function(page) {
                page.get('places').forEach(function(placeId) {
                    var place = places.get(placeId),
                        freq = place.get('frequency');
                    place.set({ frequency: freq+1 })
                });
            });
            places.sort();
        },
        
        isFullyLoaded: function() {
            return !!(this.pages.length && this.places.length);
        },
        
        // array of page labels for timemap
        labels: function() {
            return this.pages.map(function(p) { return p.id });
        },
        
        // array of items for timemap
        timemapItems: function(startId, endId) {
            var book = this,
                items = [],
                pages = book.pages,
                startIndex = startId ? pages.indexOf(pages.get(startId)) : 0,
                endIndex = endId ? pages.indexOf(pages.get(endId)) : pages.length - 1;
            pages.models.slice(startIndex, endIndex)
                .forEach(function(page) {
                    var places = page.get('places');
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
                        return places.indexOf(placeId) >= 0;
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
    
    // Collection: BookList
    gv.BookList = Collection.extend({
        model: Book,
        url: API_ROOT +  '/books.json',
        comparator: function(book) { return book.get('title') }
    });
    
}(gv));