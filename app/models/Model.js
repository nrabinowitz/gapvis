/*
 * Core setup for models
 */
(function(gv) {
    gv.API_ROOT = 'stub_api';
    
    // set up default model
    gv.Model = Backbone.Model.extend({
    
        // add .json to url
        url: function() {
            return Backbone.Model.prototype.url.call(this) + '.json'
        },
        
        // remove save/destroy
        save: $.noop,
        destroy: $.noop
        
    });
        
    gv.Collection = Backbone.Collection;
    
}(gv));