/*
 * Place models
 */
(function(gv) {
    var Model = gv.Model,
        Collection = gv.Collection,
        API_ROOT = gv.API_ROOT,
        Place;
       
    // Model: Place
    Place = gv.Place = Model.extend({
        defaults: {
            title: "Untitled Place",
            frequency: 0
        },
        
        isFullyLoaded: function() {
            return !!this.get('uri');
        }
    });
    
    // Collection: PlaceList
    gv.PlaceList = Collection.extend({
        model: Place,
        url: API_ROOT + '/place',
        comparator: function(place) {
            return -place.get('frequency')
        }
    });
    
}(gv));