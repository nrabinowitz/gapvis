/*
 * AppView (extending spf)
 */
define(['gv', 'util/slide'], function(gv, slide) {
    
    // View: AppView (master view)
    gv.AppView = gv.AppView.extend({
        
        open: function(view, fromRight) {
            view.layout();
            slide(view.$el, true, fromRight ? 'left' : 'right');
            view.layout();
        },
        
        close: function(view, fromRight, callback) {
            slide(view.$el, false, fromRight ? 'left' : 'right', callback);
        }
    
    });
    
});