/*
 * Permalink View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: PermalinkView (renders the permalink)
    gv.NavigationView = View.extend({
        tagName: 'div',
    
        initialize: function() {
            this.template = _.template($('#navigation-view-template').html())
            // listen for all state changes
            this.bindState('change', this.updatePermalink, this);
        },
        
        render: function() {
            // render content and append to parent
            $(this.el).html(this.template(this.model.toJSON()))
                .appendTo(this.options.parent.$('div.navigation-view'));
            // update
            this.updatePermalink();
            return this;
        },
        
        updatePermalink: function() {
            $('a.permalink').attr('href', gv.router.getPermalink());
        }
    
    });
    
}(gv));