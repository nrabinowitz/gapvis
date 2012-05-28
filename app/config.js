/*
 * Application configuration
 */
define({
    appElement: '#app-view',
    globalViews: ['views/MessageView'],
    views: {
        'index': {
            layout: '#layout-2col',
            className: 'index-view',
            router: ['', 'index'],
            slots: {
                '.left-column': {
                    layout: 'views/BookListView'
                },
                '.right-column': '#index-overview-template'
            }
        },
        'book-summary': {
            layout: '#layout-book-3panel',
            className: 'summary-view',
            router: 'book/:bookid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.text-slot': 'views/BookSummaryTextView',
                '.left-panel': 'views/BookSummaryMapView',
                '.right-panel': 'views/PlaceFrequencyBarsView'
            }
        },
        'reading-view': {
            layout:  '#layout-book-2panel',
            className: 'reading-view',
            router: [
                'book/:bookid/read', 
                'book/:bookid/read/:pageid',
                'book/:bookid/read/:pageid/:placeid'
            ],
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': {
                    layout: '#layout-full-top',
                    slots: {
                        '.top-slot': 'views/PagesView',
                        '.bottom-slot': 'views/PageControlView'
                    }
                },
                '.right-panel': {
                    layout: '#layout-full-top',
                    slots: {
                        '.top-slot': 'views/TimeMapView',
                        '.bottom-slot': 'views/FrequencyLegendView'
                    }
                }
            }
        },
        'place-view': {
            layout:  '#layout-book-2panel',
            className: 'place-view',
            router: 'book/:bookid/place/:placeid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': {
                    className: 'place-summary panel fill padded-scroll',
                    slots: {
                        'this': [
                            'views/PlaceSummaryView',
                            'views/BookReferencesView',
                            'views/RelatedPlacesView'
                        ]
                    }
                },
                '.right-panel': {
                    layout: '#layout-full-top',
                    className: 'place-view-right',
                    slots: {
                        '.top-slot': 'views/BookPlaceMapView',
                        '.bottom-slot': 'views/BookPlaceFlickrView'
                    }
                }
            }
        }
    }
});