/*
 * Permalink View
 */
(function(gv) {
    var state = gv.state;
    
    // View: PermalinkView (renders the permalink)
    gv.NavigationView = gv.BookView.extend({
        template: '#navigation-view-template',
        
        navViews: [
            'book-summary',
            'reading-view', 
            'place-view'
        ],
    
        initialize: function() {
            var view = this;
            // listen for all state changes
            view.bindState('change', view.updatePermalink, view);
            view.bindState('change:placeid', view.updateNavButtons, view);
            view.bindState('change:view', view.updateNavButtons, view);
        },
        
        render: function() {
            var view = this,
                cid = view.cid;
            // render content and append to parent
            view.renderTemplate({ cid: cid });
            // button it
            view.$('.nav-buttons').buttonset();
            $('#book-summary-' + cid).button('option', 'icons', {primary:'ui-icon-star'});
            $('#reading-view' + cid).button('option', 'icons', {primary:'ui-icon-note'});
            $('#place-view' + cid).button('option', 'icons', {primary:'ui-icon-pin-s'});
            view.$('.permalink').button({
                icons: {
                    primary: "ui-icon-link"
                },
                text: false
            });
            // update
            view.updatePermalink();
            view.updateNavButtons();
            return view;
        },
        
        updatePermalink: function() {
            $('a.permalink').attr('href', gv.router.getPermalink());
        },
        
        updateNavButtons: function() {
            // enable/disable place view
            $('#place-view-' + this.cid)
                .button(gv.state.get('placeid') ? 'enable' : 'disable');
            // check the appropriate button
            var viewKey = gv.state.get('view'),
                cid = this.cid;
            this.navViews.forEach(function(nav) {
                $('#' + nav + '-' + cid)
                    .prop('checked', nav == viewKey)
                    .button('refresh');
            });
        },
        
        // UI event handlers
        
        events: {
            "click input":      "uiGoToView"
        },
        
        uiGoToView: function(evt) {
            // get view from id
            var nav = $(evt.target).attr('data-view-id');
            gv.state.set({ 'view': nav });
        }
        
    
    });
    
}(gv));