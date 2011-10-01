/*
 * Change This Link View
 */
(function(gv, window) {
    var View = gv.View,
        state = gv.state;
    
    // View: ChangeLinkView (hovering change this link)
    gv.ChangeLinkView = View.extend({
        el: '#change-this-link',
        
        initialize: function() {
            var view = this;
            // button-ify change this button
            $('#change-this-link button').button({
                icons: { primary: "ui-icon-pencil" },
                text: false
            });
        },
        
        // this is called by parent view (BookReadingView)
        open: function(top, left, width, height) {
            // position the link
            $(this.el)
                .css({
                    top: top + 10,
                    left: left + width + 35
                })
                .show();
        },
        
        close: function() {
            $(this.el).hide();
        },
        
        clear: function() {
            this.close();
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
            this.close();
        },
        
        // timer control for hiding the edit link
        
        startTimer: function() {
            var view = this;
            view.clearTimer();
            view._timer = setTimeout(function() {
                view.close();
                view._timer = null;
            }, 1000);
        },
        
        clearTimer: function() {
            var timer = this._timer;
            if (timer) {
                window.clearTimeout(timer);
                this._timer = null;
            }
        }
     
    });
    
}(gv, this));