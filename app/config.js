/*
 * Application configuration
 */
define({
    appElement: '#app-view',
    globalViews: ['views/MessageView'],
    views: {
        'index': {
            layout: '#layout-2col',
            router: ['', 'index'],
            slots: {
                '.left-column': {
                    layout: 'views/BookListView'
                },
                '.right-column': '#index-overview-template'
            }
        },
        'book-summary': {
            // XXX can I make a 2-col book layout that handles the heights?
            // could work for all the book layouts...
            layout: '#layout-book-summary',
            router: 'book/:bookid',
            refreshOn: 'change:bookid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.text-slot': 'views/BookSummaryTextView',
                '.right-panel': 'views/BookSummaryMapView',
                '.left-panel': 'views/PlaceFrequencyBarsView'
            }
        },
        'reading-view': {
            // XXX: this should be reusable for the Place page
            layout: 'layouts/BookReadingLayout',
            router: [
                'book/:bookid/read', 
                'book/:bookid/read/:pageid',
                'book/:bookid/read/:pageid/:placeid'
            ],
            refreshOn: 'change:bookid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': {
                    // XXX: this should be a reusable 100% + margin piece for map and page
                    layout: '#reading-pane-template',
                    slots: {
                        '.page-controls': 'views/PageControlView'
                    }
                }
            }
        }
    }
});