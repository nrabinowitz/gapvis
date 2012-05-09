/*
 * Message View
 */
define(['gv'], function(gv) {
    var state = gv.state,
        showFor = 3000;
    
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
            if (!!state.previous('message') && view._tmid) {
                window.clearTimeout(view._tmid);
                delete view._tmid;
            }
            if (msg) {
                view.$('#message-text').text(msg);
                $(view.el).show();
                view._tmid = window.setTimeout(function() {
                    state.unset('message');
                }, showFor);
            } else {
                $(view.el).fadeOut('slow');
            }
        }
        
    });
    
});