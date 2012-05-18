/*
 * AppView (extending spf)
 */
define(['gv'], function(gv) {
    
    // CSS-based slide
    function slide($el, slideIn, direction) {
        if ($.support.transition) {
        
            var slideClass = 'sliding',
                startPos = !slideIn ? 'active' : 
                    direction == 'left' ? 'next' : 'prev';
                    
            // set initial position
            $el.addClass(startPos)
                .show();
                
            // force reflow
            $el[0].offsetWidth;
            
            // add transition classes
            $el.addClass([slideClass, direction].join(' '))
                // listen for event end
                .one($.support.transition.end, function () {
                    if (!slideIn) $el.hide();
                    $el.removeClass([startPos, direction, slideClass].join(' '));
                });
                
        } else $el.toggle(slideIn);
    }
    
    // View: AppView (master view)
    gv.AppView = gv.AppView.extend({
        
        open: function(view, fromRight) {
            view.layout();
            // view.$el.show('slide', {direction: (fromRight ? 'right' : 'left') }, 500);
            slide(view.$el, true, fromRight ? 'left' : 'right');
            view.layout();
        },
        
        close: function(view, fromRight) {
            // view.$el.hide('slide', {direction: (fromRight ? 'left' : 'right') }, 500);
            slide(view.$el, false, fromRight ? 'left' : 'right');
        }
    
    });
    
});