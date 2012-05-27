/*
 * Utility: CSS-based slide function
 */
define(function() {
    
    // CSS-based slide
    return function slide($el, slideIn, direction, callback) {
        callback = callback || $.noop;
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
                    callback();
                });
                
        } else {
            $el.toggle(slideIn);
            callback();
        }
    }
    
});