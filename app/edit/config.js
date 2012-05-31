/*
 * Application configuration
 */
define({
    appElement: '#app-view',
    globalViews: ['views/MessageView'],
    views: {
        'flags': {
            layout:  '#layout-book-3panel',
            router: 'books/:bookid/flags/:flagid',
            slots: {
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': 'views/FlagEditView',
                '.right-panel': 'views/PagesView'
            }
        }
    },
    // whether to fake PUT/DELETE
    emulateHTTP: true,
    disableChangeLink: true
});