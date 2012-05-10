/*
 * Core setup for views
 */
define(['gv'], function(gv) {
    var Layout = gv.Layout;
    
    return Layout.extend({
        el: '#layout-book-reading',
        
        // layout the bottom slot correctly
        layout: function() {
            Layout.prototype.layout.call(this);
            var view = this,
                w = view.$el.width() - 30,
                h = view.$el.height() - 60,
                titleh = view.$('.book-title-view').height(),
                padding = 15;
        }
    });
    
});