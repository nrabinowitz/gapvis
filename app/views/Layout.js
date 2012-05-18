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
                    prevHeight = 0,
                    nextHeight = 0;
                    
                // set top margin
                $fill.prevAll().each(function() {
                    prevHeight += $(this).height();
                });
                $fill.css({ marginTop: prevHeight + (prevHeight ? padding : 0) });
                
                // set bottom margin
                $fill.nextAll().each(function() {
                    nextHeight += $(this).height();
                });
                $fill.css({ marginBottom: nextHeight + (nextHeight ? padding : 0) });
            });
        }
    });
    
});