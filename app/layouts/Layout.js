/*
 * Core setup for views
 */
(function(gv, window) {
    var state = gv.state;
    
    // default layout view
    gv.Layout = gv.Layout.extend({
        // top view size
        topViewHeight: function() {
            return $(window).height() - 115;
        },
        topViewWidth: function() {
            return $(window).width() - 70;
        }
    });
    
}(gv, this));