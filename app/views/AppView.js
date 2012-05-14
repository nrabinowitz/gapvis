/*
 * AppView (extending spf)
 */
(function(gv) {
    
    // CSS-based slide
    function slide($el, slideIn, direction) {
        if ($.support.transition) {
            var slideClass = 'sliding',
                startPos = !slideIn ? 'active' : 
                    direction == 'left' ? 'next' : 'prev';
            console.log('starting slide ' + (slideIn ? 'in' : 'out') + ' ' + direction);
            $el.addClass(startPos)
                .show();
            $el[0].offsetWidth;
            
            $el.addClass([slideClass, direction].join(' '))
                // listen for event end
                .one($.support.transition.end, function () {
                    console.log('ending slide ' + (slideIn ? 'in' : 'out') + ' ' + direction);
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
    
}(gv));