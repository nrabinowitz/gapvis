/*
 * Core setup for models
 */
(function(gv) {
    // set up default model
    gv.Model = Backbone.Model.extend({
    
        // add .json to url
        url: function() {
            return Backbone.Model.prototype.url.call(this) + '.json'
        },
        
        // remove save/destroy
        save: $.noop,
        destroy: $.noop,
        
        isFullyLoaded: function() {
            // override in subclasses
            return true;
        },
        
        // callback for actions to take when fully loaded
        onReady: $.noop,
        
        // support for common pattern
        ready: function(loadCallback, immediateCallback) {
            var model = this,
                immediateCallback = immediateCallback || loadCallback;
            if (!model.isFullyLoaded()) {
                model.fetch({ 
                    success: function() {
                        model.onReady();
                        loadCallback();
                    },
                    error: function() {
                        console.log('Error fetching model with id ' + model.id)
                    }
                });
            } else {
                immediateCallback();
            }
        }
        
    });
        
    gv.Collection = Backbone.Collection.extend({
    
        // fetch list without overwriting existing objects (copied from fetch())
        fetchNew: function(options) {
            options = options || {};
            var collection = this,
                success = options.success;
            options.success = function(resp, status, xhr) {
                _(collection.parse(resp, xhr)).each(function(item) {
                    if (!collection.get(item.id)) {
                        collection.add(item, {silent:true});
                    }
                });
                if (!options.silent) collection.trigger('reset', collection, options);
                if (success) success(collection, resp);
            };
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },
        
        getOrCreate: function(modelId) {
            var model = this.get(modelId);
            if (!model) {
                model = new this.model({ id: modelId});
                this.add(model);
            }
            return model;
        }
        
    });
    
}(gv));