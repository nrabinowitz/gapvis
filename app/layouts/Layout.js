/*
 * Core setup for views
 */
(function(gv, window) {
    
    // default layout view
    gv.Layout = gv.Layout.extend({
        // top view size
        topViewWidth: function() {
            return $(window).width() - 40;
        },
        topViewHeight: function() {
            return $(window).height() - 87;
        },
        // default layout
        layout: function() {
            if (this.topLevel) {
                this.$el
                    .width(this.topViewWidth())
                    .height(this.topViewHeight());
            }
        }
    });
    
}(gv, this));