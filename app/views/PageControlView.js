/*
 * Page Control View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: PageControlView (control buttons)
    gv.PageControlView = View.extend({
        el: '#page-control-view',
        
        initialize: function(opts) {
            // listen for state changes
            state.bind('change:pageid', this.renderNextPrev, this);
            state.bind('change:pageview', this.renderPageView, this);
        },
        
        render: function() {
            this.renderNextPrev();
            this.renderPageView();
        },
        
        renderNextPrev: function() {
            // update next/prev
            var book = this.model,
                pageId = state.get('pageid') || book.firstId();
            this.prev = book.prevId(pageId);
            this.next = book.nextId(pageId);
            // render
            $('#prev').toggleClass('on', !!this.prev);
            $('#next').toggleClass('on', !!this.next);
            $('#page-id').html(pageId);
        },
        
        renderPageView: function() {
            var pageView = state.get('pageview');
            // render
            $('#showimg').toggleClass('on', pageView == 'text');
            $('#showtext').toggleClass('on', pageView == 'image');
        },
        
        clear: function() {
            $('#prev, #next').removeClass('on');
            this.unbindEvents();
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click #next.on':       'uiNext',
            'click #prev.on':       'uiPrev',
            'click #showimg.on':    'uiShowImage',
            'click #showtext.on':   'uiShowText'
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
        }
    });
    
}(gv));