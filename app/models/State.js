/*
 * State model
 */
(function(gv) {
    var State, state,
        tmParams = TimeMap.state.params;
    
    // model to hold current state
    State = Backbone.Model.extend({
        defaults: {
            pageview: 'text'
        },
        initialize: function() {
            this.params = {};
        },
        // (de)serialization functions
        deserialize: function(key, value) {
            var params = this.params,
                f = params[key] && params[key].deserialize || _.identity;
            return f(value);
        },
        serialize: function(key, value) {
            var params = this.params,
                f = params[key] && params[key].serialize || _.identity;
            return f(value);
        },
        // convenience function to set a serialized value
        setSerialized: function(key, value) {
            o = {};
            o[key] = this.deserialize(key, value);
            this.set(o);
        },
        // clear all data relating to the current book
        clearBookState: function(silent) {
            var s = this,
                opts = silent ? {silent:true} : {};
            _(_.keys(s.attributes))
                .without('topview','bookid','pageview')
                .forEach(function(k) {
                    s.unset(k, opts)
                });
        },
        // add de/serializable state parameters
        addParam: function(key, deserialize, serialize) {
            this.params[key] = {
                deserialize: deserialize || _.identity,
                serialize: serialize || _.identity
            }
        }
    });
    
    // initialize the singleton
    state = gv.state = new State();
    
    // add parameters
    state.addParam('bookid', parseInt);
    state.addParam('pageid', parseInt);
    state.addParam('placeid', parseInt);
    state.addParam('mapzoom', parseInt);
    state.addParam('mapcenter', tmParams.center.fromString, tmParams.center.toString);
    
}(gv));