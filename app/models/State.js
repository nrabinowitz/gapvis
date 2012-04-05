/*
 * State model
 */
(function(gv) {
    
    // model to hold current state
    gv.State = gv.State.extend({
    
        initialize: function() {
            var state = this;
            // listen for state changes
            state.on('change:bookid', function() {
                state.clearBookState(true);
            });
        },
    
        defaults: {
            pageview: 'text'
        },
        
        // clear all data relating to the current book
        clearBookState: function(silent) {
            var s = this,
                opts = silent ? {silent:true} : {};
            _(_.keys(s.attributes))
                .without('view','bookid','pageview')
                .forEach(function(k) {
                    s.unset(k, opts)
                });
        }
    });
    
    // reset to use new class
    gv.resetState();
    
    // add parameters
    var center = TimeMap.state.params.center;
    gv.addParameter('bookid', { deserialize: parseInt });
    gv.addParameter('pageid', { deserialize: String });
    gv.addParameter('placeid', { deserialize: parseInt });
    gv.addParameter('mapzoom', { deserialize: parseInt });
    gv.addParameter('mapcenter', { 
        deserialize: center.fromString, 
        serialize: center.toString 
    });
    
    
}(gv));