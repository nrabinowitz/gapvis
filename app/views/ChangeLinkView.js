/*
 * Change This Link View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: ChangeLinkView (hovering change this link)
    gv.ChangeLinkView = View.extend({
        el: '#change-this-link',
        
        initialize: function() {
            // button-ify change this button
            $('#change-this-link button').button({
                icons: { primary: "ui-icon-pencil" },
                text: false
            });
        },
        
        hide: function() {
            $(this.el).hide();
        },
        
        clear: function() {
            this.hide();
        },
        
        // UI Event Handlers
        
        events: {
            'mouseleave':   'uiHideChangeLink',
            'click button': 'uiButtonClick'
        },
        
        uiHideChangeLink: function() {
            this.hide();
        },
        
        uiButtonClick: function() {
            this.hide();
        }
     
    });
    
}(gv));