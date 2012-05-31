/*
 * Flag Edit View
 */
define(['gv', 'views/BookView', 'models/Flag'], function(gv, BookView, Flag) {
    var state = gv.state;
    
    return BookView.extend({
        template: '#flag-edit-template',
        className: 'flag-edit-view fill',
        
        initialize: function() {
            var view = this,
                flagId = state.get('flagid');
            view.model = new Flag({ id: flagId });
        },
    
        ready: function(callback) {
            var flag = this.model;
            flag.ready(function() {
                // set the page id
                state.set({ pageid: flag.get('pageID') });
                state.set({ placeid: flag.get('placeID') });
                callback();
            });
        },
        
        render: function() {
            this.renderTemplate();
        },
        
        // UI events
        
        events: {
            'change input[name="action"]':          'uiChangeAction',
            'change .checkbox.toggle input': 'uiToggleCheckboxes'
        },
        
        uiChangeAction: function(e) {
            this.$('.fix-actions').slideToggle($(e.target).val() == 'fix');
        },
        
        uiToggleCheckboxes: function(e) {
            var on = $(e.target).prop('checked');
            this.$('input[name="othertoken"]')
                .prop('checked', on);
        }
        
    });
    
});