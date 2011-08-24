/*
 * Permalink View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: PermalinkView (renders the permalink)
    gv.PermalinkView = View.extend({
    
        initialize: function() {
            // listen for state changes
            state.bind('change:mapzoom', this.render, this);
            state.bind('change:mapcenter', this.render, this);
        },
        
        render: function() {
            $('#permalink').attr('href', gv.router.getPermalink());
        }
    
    });
    
}(gv));