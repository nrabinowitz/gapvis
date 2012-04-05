/*
 * Index View
 */
(function(gv) {
    var AppView = gv.AppView;
    
    // View: AppView (master view)
    gv.AppView = AppView.extend({
        
        open: function(view, fromRight) {
            view.layout();
            view.$el.show('slide', {direction: (fromRight ? 'right' : 'left') }, 500);
        },
        
        close: function(fromRight) {
            view.$el.hide('slide', {direction: (fromRight ? 'left' : 'right') }, 500);
        }
    
    });
    
}(gv));