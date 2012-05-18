/*
 * Page View
 */
define(['gv', 'views/BookView', 'util/slide'], function(gv, BookView, slide) {
    var state = gv.state;
    
    // View: PageView (page content)
    return BookView.extend({
        className: 'single-page panel',
        template: '#page-template',
        
        initialize: function() {
            var view = this,
                page = view.model;
            // listen for state changes
            view.bindState('change:pageview',   view.renderPageView, view);
            view.bindState('change:placeid',    view.renderPlaceHighlight, view);
            // set backreference
            page.view = view;
            // load page
            page.ready(function() {
                view.render();
            });
        },
        
        render: function() {
            var view = this;
            view.renderTemplate();
            view.renderPageView();
            view.renderPlaceHighlight();
            return view;
        },
        
        renderPageView: function() {
            var view = this,
                pageView = state.get('pageview');
            // render
            view.$('.text').toggle(pageView == 'text');
            view.$('.img').toggle(pageView == 'image');
        },
        
        renderPlaceHighlight: function() {
            var placeId = state.get('placeid');
            // render
            this.$('span.place').each(function() {
                $(this).toggleClass('hi', $(this).attr('data-place-id') == placeId);
            });
        },
        
        open: function(width, fromRight) {
            this.$el.width(width - 24); // deal with padding
            slide(this.$el, true, fromRight ? 'right' : 'left');
        },
        
        close: function(fromRight) {
            this.$el.hide();
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .place':     'uiPlaceClick'
        },
        
        uiPlaceClick: function(e) {
            var placeId = $(e.target).attr('data-place-id');
            if (placeId) {
                state.set('placeid', placeId);
            }
        }
        
    });
    
});