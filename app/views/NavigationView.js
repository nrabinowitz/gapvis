/*
 * Permalink View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: PermalinkView (renders the permalink)
    gv.NavigationView = View.extend({
        tagName: 'div',
        
        navViews: [
            { view: gv.BookSummaryView, id: 'nav-summary' },
            { view: gv.BookReadingView, id: 'nav-reading' },
            { view: gv.BookPlaceView, id: 'nav-place' }
        ],
    
        initialize: function() {
            this.template = _.template($('#navigation-view-template').html())
            // listen for all state changes
            this.bindState('change', this.updatePermalink, this);
            this.bindState('change:placeid', this.updateNavButtons, this);
            this.bindState('change:topview', this.updateNavButtons, this);
        },
        
        render: function() {
            // render content and append to parent
            $(this.el).html(this.template({ cid: this.cid }))
                .appendTo(this.options.parent.$('div.navigation-view'));
            // button it
            this.$('.nav-buttons').buttonset();
            this.$('.permalink').button({
                icons: {
                    primary: "ui-icon-link"
                },
                text: false
            });
            // update
            this.updatePermalink();
            this.updateNavButtons();
            return this;
        },
        
        updatePermalink: function() {
            $('a.permalink').attr('href', gv.router.getPermalink());
        },
        
        updateNavButtons: function() {
            // enable/disable place view
            $('#nav-place-' + this.cid)
                .button(state.get('placeid') ? 'enable' : 'disable');
            // check the appropriate button
            var topView = state.get('topview'),
                cid = this.cid;
            this.navViews.forEach(function(nav) {
                $('#' + nav.id + '-' + cid)
                    .prop('checked', nav.view == topView)
                    .button('refresh');
            });
        },
        
        // UI event handlers
        
        events: {
            "click input":      "uiGoToView"
        },
        
        uiGoToView: function(evt) {
            // get view from id
            var id = $(evt.target).attr('id').split('-').slice(0,2).join('-'),
                nav = _(this.navViews).find(function(n) {
                    return n.id == id;
                });
            if (nav) {
                state.set({ 'topview': nav.view });
            }
        }
        
    
    });
    
}(gv));