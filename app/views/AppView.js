/*
 * AppView (extending spf)
 */
(function(gv) {
    
    // View: AppView (master view)
    gv.AppView = gv.AppView.extend({
        
        open: function(view, fromRight) {
            view.layout();
            view.$el.show('slide', {direction: (fromRight ? 'right' : 'left') }, 500);
        },
        
        close: function(view, fromRight) {
            view.$el.hide('slide', {direction: (fromRight ? 'left' : 'right') }, 500);
        }
    
    });
    
}(gv));