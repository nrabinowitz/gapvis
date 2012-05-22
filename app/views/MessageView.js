/*
 * Message View
 */
define(['gv'], function(gv) {
    var state = gv.state,
        showFor = 5000,
        timeoutId;
        
    function unsetMsg() {
        state.unset('message');
    }
    
    function clear() {
        console.log('clearing timeout');
        window.clearTimeout(timeoutId);
        delete timeoutId;
    }
    
    // View: MessageView
    return gv.View.extend({
        el: '#message-view',
        
        initialize: function(opts) {
            // listen for state changes
            state.on('change:message', this.showMessage, this);
        },
        
        showMessage: function() {
            var view = this,
                msg = state.get('message');
            if (!!state.previous('message') && timeoutId) clear();
            if (msg) {
                var text = msg.text || msg,
                    typeClass = 'alert-' + (msg.type || 'warning');
                view.$('.alert')
                    .removeClass('alert-error alert-success alert-info')
                    .addClass(typeClass)
                    .find('span')
                        .text(text);
                $(view.el).show();
                timeoutId = window.setTimeout(unsetMsg, showFor);
            } else {
                $(view.el).fadeOut();
            }
        },
        
        // UI events
        
        events: {
            'click .close':     unsetMsg,
            'mouseover .alert': clear
        }
        
    });
    
});