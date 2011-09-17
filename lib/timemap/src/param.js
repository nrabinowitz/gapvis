/*
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * This file defines the Param class, which is used to get, set, and serialize
 * different fields on TimeMap and TimeMapItem objects.
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */

// save a few bytes
(function() {

/**
 * @name TimeMap.params
 * @namespace Namespace for parameter classes
 */
var params = TimeMap.params = {
    /**
     * @class
     * A parameter, with methods to get, set, and serialize the current value.
     *
     * @constructor
     * @param {String} paramName        String name of the parameter
     * @param {Object} options          Container for named arguments
     * @param {String} [sourceName]             String name of the source element, if different
     * @param {Function} [options.get]          Function to get the current param value
     * @param {Function} [options.set]          Function to set the param to a new value
     * @param {Function} [options.setConfig]    Function to set a new value in a config object
     * @param {Function} [options.fromStr]      Function to parse the value from a string
     * @param {Function} [options.toStr]        Function to serialize the current value to a string
     * @param {Function} [options.setConfigXML] Function to parse the value from an XML node and set to config
     */
    Param: function(paramName, options) {
        var param = this;
        options = options || {};
        
        /**
         * String name of this param
         * @name TimeMap.params.Param#paramName
         * @type String
         */
        param.paramName = paramName;
        
        /**
         * String name of the source element, if different
         * @name TimeMap.params.Param#sourceName
         */
        param.sourceName = options.sourceName || paramName;
    
        /**
         * Get the current state value from a TimeMap or TimeMapItem object
         * @name TimeMap.params.Param#get
         * @function
         *
         * @param {TimeMap|TimeMapItem} o       Object to inspect
         * @return {mixed}                      Current state value
         */
        param.get = options.get;
        
        /**
         * Set the current state value on a TimeMap or TimeMapItem object
         * @name TimeMap.params.Param#set
         * @function
         *
         * @param {TimeMap|TimeMapItem} o       Object to modify
         * @param {mixed} value                 Value to set
         */
        param.set = options.set;
        
        /**
         * Set a new value on a config object for TimeMap.init()
         * @name TimeMap.params.Param#setConfig
         * @function
         * @see TimeMap.init
         *
         * @param {Object} config   Config object to modify
         * @param {mixed} value     Value to set
         */
        param.setConfig = options.setConfig || function(config, value) {
            // default: set at top level
            config[paramName] = value;
        };
        
        /**
         * Parse a state value from a string
         * @name TimeMap.params.Param#fromString
         * @function
         *
         * @param {String} s        String to parse
         * @return {mixed}          Current state value
         */
        param.fromString = options.fromStr || function(s) {
            // default: param is a string
            return s;
        };
        
        /**
         * Serialize a state value as a string
         * @name TimeMap.params.Param#toString
         * @function
         *
         * @param {mixed} value     Value to serialize
         * @return {String}         Serialized string
         */
        param.toString = options.toStr || function(value) {
            // default: use the built-in string method
            return value.toString();
        };
        
        /**
         * Get the current value as a string
         * @name TimeMap.params.Param#getString
         * @function
         * 
         * @param {TimeMap|TimeMapItem} o       Object to inspect
         */
        param.getString = function(o) {
            param.toString(param.get(o));
        };
        
        /**
         * Set the current state value from a string
         * @name TimeMap.params.Param#setString
         * @function
         * 
         * @param {TimeMap|TimeMapItem} o       Object to modify
         * @param {String} s                    String version of value to set
         */
        param.setString = function(o, s) {
            param.set(o, param.fromString(s));
        };
        
        /**
         * Set a config object based on an XML tag
         * @name TimeMap.params.Param#setConfigXML
         * @function
         * 
         * @param {Object} config       Config object to modify
         * @param {XML NodeList} node   Parent node of the desired tag
         */
        param.setConfigXML = options.setConfigXML || function(config, node) {
            var tagName = param.sourceName,
                nameParts = tagName.split(':'), 
                ns; 
            // deal with namespaced tags
            if (nameParts.length > 1) {
                tagName = nameParts[1];
                ns = nameParts[0];
            }
            // set to config
            param.setConfig(config, TimeMap.util.getTagValue(node, tagName, ns));
        };
    },

    /**
     * @class
     * A convenience class for those parameters which deal with a value
     * in the options of a TimeMap or TimeMapItem object, setting some
     * additional default functions.
     *
     * @augments TimeMap.params.Param
     *
     * @constructor
     * @param {String} paramName        String name of the option parameter
     * @param {Object} [options]        Container for named arguments (see {@link TimeMap.params.Param})
     */
    OptionParam: function(paramName, options) {
        options = options || {};
        var defaults = {
            
            /**
             * Get the current state value from the opts object of a TimeMap or TimeMapItem
             * @name TimeMap.params.OptionParam#get
             * @function
             *
             * @param {TimeMap|TimeMapItem} o       Object to inspect
             * @return {mixed}                      Current state value
             */
            get: function(o) {
                return o.opts[paramName];
            },
            
            /**
             * Set the state value in the opts object of a TimeMap or TimeMapItem
             * @name TimeMap.params.OptionParam#set
             *
             * @param {TimeMap|TimeMapItem} o       Object to modify
             * @param {mixed} value                 Value to set
             */
            set: function(o, value) {
                o.opts[paramName] = value;
            },
            
            /**
             * Set a new value on a config object for TimeMap.init() or a particular item
             * @name TimeMap.params.OptionParam#setConfig
             * @function
             *
             * @param {Object} config   Config object to modify
             * @param {mixed} value     Value to set
             */
            setConfig: function(config, value) {
                config.options = config.options || {};
                config.options[paramName] = value;
            }
            
        };
        options = $.extend(defaults, options);
        return new params.Param(paramName, options);
    }
};


/*----------------------------------------------------------------------------
 * TimeMapItem params
 *---------------------------------------------------------------------------*/

/**
 * @namespace Namespace for parameters used for loading data into a TimeMapItem 
 * object. Because these are intended for loading, only setConfig is defined.
 */
TimeMap.loaders.base.prototype.params = {
    /**
     * Item title
     * @type TimeMap.params.Param
     */
    title: new params.Param("title"),
    
    /**
     * Item start date
     * @type TimeMap.params.Param
     */
    start: new params.Param("start"),
    
    /**
     * Item end date
     * @type TimeMap.params.Param
     */
    end: new params.Param("end"),
    
    /**
     * Item description
     * @type TimeMap.params.OptionParam
     */
    description: new params.OptionParam("description"),
    
    /**
     * Item latitude
     * @type TimeMap.params.Param
     */
    lat: new params.Param("lat", {
        setConfig: function(config, value) {
            config.point = config.point || {};
            config.point.lat = value;
        }
    }),
    
    /**
     * Item longitude
     * @type TimeMap.params.Param
     */
    lon: new params.Param("lon", {
        setConfig: function(config, value) {
            config.point = config.point || {};
            config.point.lon = value;
        }
    })
};

})();
