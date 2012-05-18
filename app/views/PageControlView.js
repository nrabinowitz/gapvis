/*
 * Page Control View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: PageControlView (control buttons)
    return BookView.extend({
        className: 'page-control-view',
        template: '#page-control-template',
        
        initialize: function(opts) {
            var view = this;
            // listen for state changes
            view.bindState('change:pageid', view.renderNextPrev, view);
            view.bindState('change:pageview', view.renderPageView, view);
        },
        
        render: function() {
            var view = this;
            // fill in template
            view.renderTemplate();
            view.renderNextPrev();
            view.renderPageView();
        },
        
        renderNextPrev: function() {
            // update next/prev
            var view = this,
                book = view.model,
                pageId = state.get('pageid') || book.firstId(),
                prev = view.prev = book.prevId(pageId),
                next = view.next = book.nextId(pageId);
            // render
            view.$('.prev').toggleClass('on', !!prev);
            view.$('.next').toggleClass('on', !!next);
            view.$('.page-id').val(pageId);
        },
        
        renderPageView: function() {
            var view = this,
                pageView = state.get('pageview');
            // render
            view.$('.showimg').toggleClass('on', pageView == 'text');
            view.$('.showtext').toggleClass('on', pageView == 'image');
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .next.on':       'uiNext',
            'click .prev.on':       'uiPrev',
            'click .showimg.on':    'uiShowImage',
            'click .showtext.on':   'uiShowText',
            'change .page-id':      'uiJumpToPage'
        },
        
        uiNext: function() {
            state.set({ pageid: this.next });
        },
        
        uiPrev: function() {
            state.set({ pageid: this.prev });
        },
        
        uiShowImage: function() {
            state.set({ pageview:'image' })
        },
        
        uiShowText: function() {
            state.set({ pageview:'text' })
        },
        
        uiJumpToPage: function(e) {
            var pageId = $(e.target).val();
            if (pageId && this.model.pages.get(pageId)) {
                // valid pageId
                state.set({ scrolljump: true });
                state.set('pageid', pageId);
            } else {
                // not valid
                this.renderNextPrev();
                state.set({ message: "Sorry, there isn't a page '" + pageId + "' in this book"});
            }
        }
    });
    
});