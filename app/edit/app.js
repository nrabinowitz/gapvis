/*!
 * Copyright (c) 2011, Nick Rabinowitz / Google Ancient Places Project
 * Licensed under the BSD License (see LICENSE.txt)
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

require(['gv', 'edit/config', 'models/Books', 'models/State', 'views/AppView', 'views/Layout', 'routers/Router'], 
    function(gv, config, Books) {
    
    // fake PUT and DELETE requests
    Backbone.emulateHTTP = true;
    
    // initialize empty book list
    gv.books = new Books();
    
    gv.settings.disableChangeLink = true;
    
    // kick things off
    $(function() {
        gv.configure(config)
            .start();
        if (DEBUG) console.log('Editing Application initialized');
    });
    
});