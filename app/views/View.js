/*
 * Core setup for views
 */
(function(gv) {

    // default view
    gv.View = Backbone.View.extend({
        // basic open/close support
        open: function() {
            $(this.el).show();
        },
        close: function() {
            $(this.el).hide();
        },
        clear: function() {
            $(this.el).empty();
        }
    });
    
}(gv));