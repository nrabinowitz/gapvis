/*
 * Place models
 */
(function(gv) {
    var Model = gv.Model,
        Collection = gv.Collection,
        API_ROOT = gv.settings.API_ROOT,
        Place;
       
    // Model: Place
    Place = gv.Place = Model.extend({
        defaults: {
            title: "Untitled Place",
            frequency: 0
        },
        
        isFullyLoaded: function() {
            return !!this.get('uri');
        },
        
        // calculate related places within a book
        related: function(book) {
            var place = this,
                key = 'related-' + book.id,
                related = place.get(key);
            if (!related) {
                // calculate related places
                related = {};
                book.pages.each(function(page) {
                    var pplaces = page.get('places');
                    if (pplaces && pplaces.indexOf(place.id) >= 0) {
                        pplaces.forEach(function(p) {
                            if (p != place.id) {
                                var rkey = [p, place.id].sort().join('-');
                                if (!(rkey in related)) {
                                    related[rkey] = {
                                        place: book.places.get(p),
                                        count: 0
                                    };
                                }
                                related[rkey].count++;
                            }
                        })
                    }
                });
                related = _(_(related).values())
                    .sortBy(function(d) { return -d.count });
                // save
                var o = {};
                o[key] = related;
                place.set(o);
            }
            return related;
        },
        
        gmapLatLng: function() {
            var ll = this.get('ll');
            return new google.maps.LatLng(ll[0], ll[1]);
        }
    });
    
    // Collection: PlaceList
    gv.PlaceList = Collection.extend({
        model: Place,
        url: API_ROOT + '/places',
        comparator: function(place) {
            return -place.get('frequency')
        }
    });
    
}(gv));