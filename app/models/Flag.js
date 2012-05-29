/*
 * Flag model
 */
define(['gv', 'models/Model'], function(gv, Model) {
    var settings = gv.settings;
       
    // Model: Flag
    return Model.extend({
        type: 'flag',
        
        url: function() {
            return gv.settings.REPORT_URL + (this.isNew() ? 'new' : this.id);
        },
        
        isFullyLoaded: function() {
            return !!this.get('tokenID');
        }
    });
    
});