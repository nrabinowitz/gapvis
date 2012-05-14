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
                w = view.$el.width() - 30,
                h = view.$el.height() - 60,
                titleh = view.$('.book-title-view').height(),
                lw = ~~w*3/5,
                padding = 15,
                texth;
                
            view.$('.bottom-slot')
                .height(h - titleh);
                
            texth = view.$('.text-slot')
                //.width(lw)
                .height();
                
            view.$('.left-panel')
                //.width(lw)
                .height(h - titleh - texth - padding);
                
            view.$('.right-panel')
                //.width(w - lw - padding)
                .height(h - titleh);
        }
    });
    
});