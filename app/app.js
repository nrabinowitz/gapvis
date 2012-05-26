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
    render:
    - adjusting the layout of their container boxes
    - creating their content
    events:
    - listening for ui events, updating state
    ui methods:
    - updating ui on state change
    - updating ui on model change
 - Routers are responsible for:
    - setting state depending on route
    - setting route depending on state
    
 Process of opening a view:
 - URL router or UI event sets state.topview to the requested view class
 - State fires topview:change
 - AppView receives event, closes other views, calls view.open()
 - view clears previous content if necessary
 - view either renders, or fetches data and renders in the callback
*/

// removed in production by uglify
if (typeof DEBUG === 'undefined') {
    DEBUG = true;
    // cache busting for development
    require.config({
        urlArgs: "bust=" +  (new Date()).getTime()
    });
}

require.config({
    baseUrl: 'app'
});

require(['gv', 'config', 'models/Books', 'models/State', 'views/AppView', 'views/Layout', 'routers/Router'], 
    function(gv, config, Books) {
    
    // change Backbone.sync to use JSON/JSONP
    var defaultSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options = _.extend({
            dataType: gv.settings.API_DATA_TYPE,
            cache: true
        }, options);
        defaultSync(method, model, options);
    }
    
    // initialize empty book list
    gv.books = new Books();
    
    // add parameters for permalinks
    gv.addParameter('bookid', { deserialize: parseInt });
    gv.addParameter('pageid', { deserialize: String });
    gv.addParameter('placeid', { deserialize: parseInt });
    gv.addParameter('pageview');
    gv.addParameter('mapzoom', { deserialize: parseInt });
    gv.addParameter('mapcenter', { 
        deserialize: function(s) {
            var params = s.split(",");
            return params.length < 2 ? null :
                new mxn.LatLonPoint(
                    parseFloat(params[0]),
                    parseFloat(params[1])
                );
        }, 
        serialize: function(value) {
            return value.lat + "," + value.lng;
        }
    });
    
    // kick things off
    $(function() {
        gv.configure(config)
            .start();
        DEBUG && console.log('Application initialized');
    });
    
});