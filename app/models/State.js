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
        }
    });
    
    // initialize the singleton
    state = gv.state = new State();
    
    // factory for de/serializable state parameters
    function param(deserialize, serialize) {
        return {
            deserialize: deserialize || _.identity,
            serialize: serialize || _.identity
        };
    };
    
    // add parameters
    state.params = {
        bookid: param(parseInt),
        pageid: param(parseInt),
        placeid: param(parseInt),
        mapzoom: param(parseInt),
        mapcenter: param(tmParams.center.fromString, tmParams.center.toString)
    };
    
}(gv));