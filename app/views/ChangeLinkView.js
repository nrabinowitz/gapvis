/*
 * Change This Link View
 */
define(['gv', 'views/ChangeFormView'], function(gv, ChangeFormView) {
    var state = gv.state,
        timer;
    
    // View: ChangeLinkView (hovering change this link)
    return gv.View.extend({
        el: '#change-this-link',
        
        // this is called by parent view (PagesView)
        open: function(top, left, width, height) {
            // position the link
            $(this.el)
                .css({
                    top: top - 15,
                    left: left + width + 5
                })
                .show();
        },
        
        close: function() {
            $(this.el).hide();
        },
        
        clear: function() {
            var view = this;
            if (view.form) view.form.clear();
            view.close();
            view.undelegateEvents();
        },
        
        // lazy instantiation of form view
        openForm: function() {
            if (!this.form) {
                this.form = new ChangeFormView({ model: this.model });
            }
            this.form.open();
        },
        
        // UI Event Handlers
        
        events: {
            'mouseover':    'uiMouseOver',
            'mouseleave':   'close',
            'click button': 'uiButtonClick'
        },
        
        uiMouseOver: function() {
            this.clearTimer();
        },
        
        uiButtonClick: function() {
            this.openForm();
            this.close();
        },
        
        // timer control for hiding the edit link
        
        startTimer: function() {
            var view = this;
            view.clearTimer();
            timer = setTimeout(function() {
                view.close();
                timer = null;
            }, 1000);
        },
        
        clearTimer: function() {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
        }
     
    });
    
});