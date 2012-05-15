/*
 * Core setup for views
 */
define(['gv'], function(gv) {
    
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
            // fill screen
            if (this.topLevel) {
                this.$el
                    .width(this.topViewWidth())
                    .height(this.topViewHeight());
            }
            
            // fill height as necessary
            this.$('.fill').each(function() {
                // add up sibling heights
                var $fill = $(this),
                    padding = 12,
                    sibHeight = 0;
                $fill.siblings().each(function() {
                    sibHeight += $(this).height();
                });
                // set top margin
                $fill.css({ marginTop: sibHeight + padding });
            });
        }
    });
    
});