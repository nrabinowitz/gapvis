/*
 * Book Summary Layout
 */
define(['gv'], function(gv) {
    var Layout = gv.Layout;
    
    
    return Layout.extend({
        el: '#layout-book-summary',
        
        // layout the bottom slot correctly
        layout: function() {
            Layout.prototype.layout.call(this);
            var view = this,
                h = view.$el.height() - 60,
                titleh = view.$('.book-title-view').height(),
                padding = 15,
                texth;
                
            view.$('.bottom-slot')
                .height(h - titleh);
                
            texth = view.$('.text-slot')
                .height();
                
            view.$('.left-panel')
                .height(h - titleh - texth - padding);
                
            view.$('.right-panel')
                .height(h - titleh);
        }
    });
    
});