/*
 * Master view for pages
 */
define(['gv', 'views/BookView', 'views/PageView', 'views/ChangeLinkView'], 
    function(gv, BookView, PageView, ChangeLinkView) {
    
    var state = gv.state;
    
    // View: PagesView (master view for the book reading screen)
    return BookView.extend({
        className: 'page-view loading',
        
        initialize: function() {
            var view = this;
            view.changeLink = new ChangeLinkView();
            // listen for state changes
            view.bindState('change:pageid', view.render, view);
        },
        
        clear: function() {
            var view = this;
            view.changeLink.clear();
            BookView.prototype.clear.call(view);
        },
        
        render: function() {
            var view = this,
                book = view.model,
                pages = book.pages,
                pageId = state.get('pageid'),
                oldPage;
                
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
                view.$el.addClass('loading');
                page.on('change', function() {
                    view.$el
                        .append(page.view.render().el)
                        .removeClass('loading');
                    view.render();
                });
                new PageView({ model: page });
            } 
            // page view has been created; show
            else {
                view.pageView = page.view;
                page.view.open(
                    // send final width
                    view.$el.width(),
                    // figure out left/right
                    oldPage && pages.indexOf(oldPage) > pages.indexOf(page)
                );
            }
            return view;
        },
        
        // UI events
        
        events: {
            'mouseover span.place':  'uiShowChangeLink',
            'mouseleave span.place': 'uiHideChangeLink'
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
    
});