/*
 * Permalink View
 */
(function(window, gv) {
    var View = gv.View,
        state = gv.state,
        PermalinkView;
    
    // View: PermalinkView (renders the permalink)
    PermalinkView = View.extend({
    
        initialize: function() {
            // listen for state changes
            state.bind('change:mapzoom', this.render, this);
            state.bind('change:mapcenter', this.render, this);
        },
        
        render: function() {
            $('#permalink').attr('href', gv.router.getPermalink());
        }
    
    });
    
}(window, gv));