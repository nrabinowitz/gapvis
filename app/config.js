/*
 * Application configuration
 */
define({
    appElement: '#app-view',
    globalViews: ['views/MessageView'],
    views: {
        'index': {
            layout: '#layout-index',
            router: ['', 'index'],
            slots: {
                '#book-list-view': {
                    layout: 'views/BookListView'
                },
                '.overview': '#index-overview-template'
            }
        },
        'book-summary': {
            layout: 'layouts/BookSummaryLayout',
            router: 'book/:bookid',
            refreshOn: 'change:bookid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.text-slot': 'views/BookSummaryTextView',
                '.left-panel': 'views/BookSummaryMapView',
                '.right-panel': 'views/PlaceFrequencyBarsView'
            }
        },
        'reading-view': {
            layout: 'layouts/BookReadingLayout',
            router: [
                'book/:bookid/read', 
                'book/:bookid/read/:pageid',
                'book/:bookid/read/:pageid/:placeid'
            ],
            refreshOn: 'change:bookid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView'
            }
        }
    }
});

/* set up top-level views
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
                },
                'book-summary': {
                    layout: gv.BookSummaryLayout,
                    router: 'book/:bookid',
                    refreshOn: 'change:bookid',
                    slots: {
                        '.navigation-view': gv.NavigationView,
                        '.book-title-view': gv.BookTitleView,
                        '.text-slot': gv.BookSummaryTextView,
                        '.left-panel': gv.BookSummaryMapView,
                        '.right-panel': gv.PlaceFrequencyBarsView
                    }
                },
                'reading-view': {
                    layout: gv.BookReadingLayout,
                    router: [
                        'book/:bookid/read', 
                        'book/:bookid/read/:pageid',
                        'book/:bookid/read/:pageid/:placeid'
                    ],
                    refreshOn: 'change:bookid',
                    slots: {
                        '.navigation-view': gv.NavigationView,
                        '.book-title-view': gv.BookTitleView
                    }
                }
            }
        }).start(); */