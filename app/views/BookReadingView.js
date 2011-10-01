/*
 * Book Reading View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookReadingView (master view for the book reading screen)
    gv.BookReadingView = gv.BookView.extend({
        el: '#book-view',
        
        initialize: function(opts) {
            var view = this;
            // set child classes
            view.childClasses = [
                gv.NavigationView,
                gv.BookTitleView,
                gv.PageControlView,
                gv.TimeMapView
            ];
            this.changeLink = new gv.ChangeLinkView();
            // listen for state changes
            state.bind('change:pageid', view.updatePage, view);
            // super initialization kicks off model fetch
            gv.BookView.prototype.initialize.call(this);
        },
        
        render: function() {
            gv.BookView.prototype.render.call(this);
            this.updatePage();
        },
        
        clear: function() {
            gv.BookView.prototype.clear.call(this);
            this.changeLink.clear();
            $('#page-view').empty();
        },
        
        updatePage: function() {
            var view = this,
                book = view.model,
                pages = book.pages,
                pageId = state.get('pageid'),
                oldPage;
            // we're still loading, come back later
            if (!pages.length) {
                pages.bind('reset', view.openPage, view);
                return;
            }
            // get the relevant page
            var page = pageId && pages.get(pageId) || 
                pages.first();
            // another page is open; close it
            if (view.pageView) {
                view.pageView.close();
                // grab the old page for comparison
                oldPage = view.pageView.model;
            }
            // make a new page view if necessary
            if (!page.view) {
                page.bind('change', function() {
                    $('#page-view').append(page.view.render().el);
                    view.updatePage();
                });
                new gv.PageView({ model: page });
            } 
            // page view has been created; show
            else {
                view.pageView = page.view;
                page.view.open(
                    // figure out left/right
                    oldPage && pages.indexOf(oldPage) > pages.indexOf(page)
                );
            }
        },
        
        // UI events
        
        events: {
            'mouseover #page-view span.place':  'uiShowChangeLink',
            'mouseleave #page-view span.place': 'uiHideChangeLink'
        },
        
        uiShowChangeLink: function(e) {
            var $placeSpan = $(e.target),
                offset = $placeSpan.offset();
            // set the place to edit in the state
            state.set({ changelinkid: $placeSpan.attr('data-place-id') });
            // clear existing timer, if any
            this.changeLink.clearTimer();
            // show the link
            this.changeLink.open(
                offset.top, 
                offset.left, 
                $placeSpan.width(), 
                $placeSpan.height()
            );
        },
        
        uiHideChangeLink: function() {
            // start countdown to close
            this.changeLink.startTimer();
        }
        
    });
    
}(gv));