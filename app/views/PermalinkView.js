/*
 * Permalink View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: PermalinkView (renders the permalink)
    gv.PermalinkView = View.extend({
    
        initialize: function() {
            // listen for all state changes
            state.bind('change', this.render, this);
        },
        
        render: function() {
            $('#permalink').attr('href', gv.router.getPermalink());
        }
    
    });
    
}(gv));