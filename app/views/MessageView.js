/*
 * Message View
 */
(function(gv) {
    var state = gv.state,
        showFor = 3000;
    
    // View: MessageView (master view for the book reading screen)
    gv.MessageView = gv.View.extend({
        el: '#message-view',
        
        initialize: function(opts) {
            // listen for state changes
            state.on('change:message', this.showMessage, this);
        },
        
        showMessage: function() {
            var msg = state.get('message');
            // XXX: this should clear the timeout if !!state.previous('message')
            if (msg) {
                this.$('#message-text').text(msg);
                $(this.el).show();
                window.setTimeout(function() {
                    state.unset('message');
                }, showFor);
            } else {
                $(this.el).fadeOut('slow');
            }
        }
        
    });
    
}(gv));