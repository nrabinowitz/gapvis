/*
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * Functions in this file are used to set the timemap state programmatically,
 * either in a script or from the url hash.
 *
 * @requires param.js
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */
 
// save a few bytes
(function() {

/*----------------------------------------------------------------------------
 * State namespace, with setters, serializers, and url functions
 *---------------------------------------------------------------------------*/

var paramNS = TimeMap.params,

    /**
     * @name TimeMap.state
     * @namespace Namespace for static state functions used to 
     * set the timemap state programmatically, either in a script or 
     * from the url hash.
     * @see <a href="../../examples/state.html#zoom=8&center=44.04811573082351,13.29345703125&date=1500-01-21T12:17:37Z&selected=0">State Example</a>
     */
    stateNS = TimeMap.state = {
    
    /**
     * Get the state parameters from the URL, returning as a config object
     * 
     * @return {Object}             Object with state config settings
     */
    fromUrl: function() {
        var pairs = location.hash.substring(1).split('&'),
            params = stateNS.params,
            state = {};
        pairs.forEach(function(pair) {
            var kv = pair.split('=');
            if (kv.length > 1) {
                key = kv[0];
                if (key && key in params) {
                    state[key] = params[key].fromString(decodeURI(kv[1]));
                }
            }
        });
        return state;
    },
    
    /**
     * Make a parameter string from a state object
     *
     * @param {Object} state        Object with state config settings
     * @return {String}             Parameter string in URL param format
     */
    toParamString: function(state) {
        var params = stateNS.params, 
            paramArray = [], 
            key;
        // go through each key in state
        for (key in state) {
            if (state.hasOwnProperty(key)) {
                if (key in params) {
                    paramArray.push(key + "=" + encodeURI(params[key].toString(state[key])));
                }
            }
        }
        return paramArray.join("&");
    },
    
    /**
     * Make a full URL from a state object
     *
     * @param {Object} state        Object with state config settings
     * @return {String}             Full URL with parameters
     */
    toUrl: function(state) {
        var paramString = stateNS.toParamString(state),
            url = location.href.split("#")[0];
        return url + "#" + paramString;
    },
    
    /**
     * Set state settings on a config object for TimeMap.init()
     * @see TimeMap.init
     *
     * @param {Object} config       Config object for TimeMap.init(), modified in place
     * @param {Object} state        Object with state config settings
     */
    setConfig: function(config, state) {
        var params = stateNS.params,
            key;
        for (key in state) {
            if (state.hasOwnProperty(key)) {
                if (key in params) {
                    params[key].setConfig(config, state[key]);
                }
            }
        }
    },
    
    /**
     * Set state settings on a config object for TimeMap.init() using
     * parameters in the URL. Note that as of Timemap.js v.1.6, this
     * will run automatically if state functions are present.
     * @see TimeMap.init
     * @example
 // set up the config object
 var config = {
    // various settings, as usual for TimeMap.init()
 };
 
 // get state settings from the URL, e.g.:
 // http://www.example.com/mytimemap.html#zoom=4&selected=1
 TimeMap.state.setConfigFromUrl(config);
 
 // initialize TimeMap object
 var tm = TimeMap.init(config);
     *
     * @param {Object} config       Config object for TimeMap.init()
     */
    setConfigFromUrl: function(config) {
        stateNS.setConfig(config, stateNS.fromUrl());
    }

};

/*----------------------------------------------------------------------------
 * TimeMap object methods
 *---------------------------------------------------------------------------*/

/**
 * Set the timemap state with a set of configuration options.
 *
 * @param {Object} state    Object with state config settings
 */
TimeMap.prototype.setState = function(state) {
    var params = stateNS.params,
        key;
    // go through each key in state
    for (key in state) {
        if (state.hasOwnProperty(key)) {
            if (key in params) {
                // run setter function with config value
                params[key].set(this, state[key]);
            }
        }
    }
};

/**
 * Get a configuration object of state variables
 *
 * @return {Object}     Object with state config settings
 */
TimeMap.prototype.getState = function() {
    var state = {},
        params = stateNS.params,
        key;
    // run through params, adding values to state
    for (key in params) {
        if (params.hasOwnProperty(key)) {
            // get state value
            state[key] = params[key].get(this);
        }
    }
    return state;
};

/**
 * Initialize state tracking based on URL. 
 * Note: continuous tracking will only work
 * on browsers that support the "onhashchange" event.
 */
TimeMap.prototype.initState = function() {   
    var tm = this;
    tm.setStateFromUrl();
    window.onhashchange = function() {
        tm.setStateFromUrl();
    };
};

/**
 * Set the timemap state with parameters in the URL
 */
TimeMap.prototype.setStateFromUrl = function() {
    this.setState(stateNS.fromUrl());
};

/**
 * Get current state parameters serialized as a hash string
 *
 * @return {String}     State parameters serialized as a hash string
 */
TimeMap.prototype.getStateParamString = function() {
    return stateNS.toParamString(this.getState());
};

/**
 * Get URL with current state parameters in hash
 *
 * @return {String}     URL with state parameters
 */
TimeMap.prototype.getStateUrl = function() {
    return stateNS.toUrl(this.getState());
};


/*----------------------------------------------------------------------------
 * State parameters
 *---------------------------------------------------------------------------*/

/**
 * @namespace
 * Namespace for state parameters, each with a set of functions to set and serialize values.
 * Add your own Param objects to this namespace to get and set additional state variables.
 */
TimeMap.state.params = {
        
        /**
         * Map zoom level
         * @type TimeMap.params.Param
         */
        zoom: new paramNS.OptionParam("mapZoom", {
            get: function(tm) {
                return tm.map.getZoom();
            },
            set: function(tm, value) {
                tm.map.setZoom(value);
            },
            fromStr: function(s) {
                return parseInt(s, 10);
            }
        }),
        
        /**
         * Map center
         * @type TimeMap.params.Param
         */
        center: new paramNS.OptionParam("mapCenter", {
            get: function(tm) {
                return tm.map.getCenter();
            },
            set: function(tm, value) {
                tm.map.setCenter(value);
            },
            fromStr: function(s) {
                var params = s.split(",");
                if (params.length < 2) {
                    // give up
                    return null;
                }
                return new mxn.LatLonPoint(
                    parseFloat(params[0]),
                    parseFloat(params[1])
                );
            },
            toStr: function(value) {
                return value.lat + "," + value.lng;
            }
        }),
        
        /**
         * Timeline center date
         * @type TimeMap.params.Param
         */
        date: new paramNS.Param("scrollTo", {
            get: function(tm) {
                return tm.timeline.getBand(0).getCenterVisibleDate();
            },
            set: function(tm, value) {
                tm.scrollToDate(value);
            },
            fromStr: function(s) {
                return TimeMap.dateParsers.hybrid(s);
            },
            toStr: function(value) {
                return TimeMap.util.formatDate(value);
            }
        }),
        
        /**
         * Index of selected/open item, if any
         * @type TimeMap.params.Param
         */
        selected: new paramNS.OptionParam("selected", {
            set: function(tm, value) {
                var ds = value && tm.datasets[value.dataset],
                    item;
                if (ds) {
                    item = ds.getItems()[value.index];
                    if (item) {
                        item.openInfoWindow();
                    }
                }
            },
            // this will return a value suitable for set(),
            // but it won't return the item itself.
            fromStr: function(s) {
                if (s) {
                    var i = s.lastIndexOf('-'), 
                        dsid, idx;
                    if (i >= 0) {
                        return {
                            dataset: s.substr(0,i),
                            index: parseInt(s.substr(i+1))
                        };
                    }
                }
            },
            toStr: function(item) {
                // serialize with dataset and index
                var ds = item && item.dataset;
                return item ? ds.id + '-' + ds.items.indexOf(item) : '';
            }
        })
};

})();
