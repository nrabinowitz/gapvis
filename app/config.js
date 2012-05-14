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