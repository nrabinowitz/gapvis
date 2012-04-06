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

/**
 * @namespace
 * Top-level namespace for the GapVis application
 */
var gv = _.extend(spf, {

    init: function() {
        // XXX: Do I need this?
        gv.books = new gv.BookList();
        // XXX: set up screens etc
        gv.configure({
            appElement: '#app-view',
            globalViews: [gv.MessageView],
            views: {
                'index': {
                    layout: '#layout-index',
                    router: ['', 'index'],
                    slots: {
                        '#book-list-view': {
                            layout: gv.BookListView
                        },
                        '.overview': '#index-overview-template'
                    }
                }
            }
        }).start();
    }

});

// kick things off
$(gv.init);