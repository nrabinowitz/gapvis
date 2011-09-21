/*
 * Page View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: PageView (page content)
    gv.PageView = View.extend({
        tagName: 'div',
        className: 'single-page',
        
        initialize: function() {
            var view = this,
                page = view.model;
            view.template = _.template($('#page-template').html());
            // listen for state changes
            state.bind('change:pageview', this.renderPageView, this);
            state.bind('change:placeid', this.renderPlaceHighlight, this);
            // set backreference
            page.view = view;
            // load page
            page.ready(function() {
                view.render();
            });
        },
        
        layout: function() {
            $(this.el)
                .height(this.topViewHeight() * .8 - 75)
                .width(this.topViewWidth() * .4 - 45)
        },
        
        render: function() {
            var view = this;
            $(view.el)
                .html(view.template(view.model.toJSON()));
            view.bindingLayout();
            view.renderPageView();
            view.renderPlaceHighlight();
            return view;
        },
        
        renderPageView: function() {
            var pageView = state.get('pageview');
            // render
            this.$('.text').toggle(pageView == 'text');
            this.$('.img').toggle(pageView == 'image');
        },
        
        renderPlaceHighlight: function() {
            var placeId = state.get('placeid');
            // render
            this.$('span.place').each(function() {
                $(this).toggleClass('hi', $(this).attr('data-place-id') == placeId);
            });
        },
        
        open: function(fromLeft) {
            $(this.el).show('slide', {direction: (fromLeft ? 'left' : 'right') }, 500);
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .place':    'uiPlaceClick'
        },
        
        uiPlaceClick: function(e) {
            var placeId = $(e.target).attr('data-place-id');
            if (placeId) {
                state.setSerialized('placeid', placeId);
            }
        }
        
    });
    
}(gv));