/* 
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */
 
/**
 * @fileOverview
 * Metaweb Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */
 
// for JSLint
/*global TimeMap */

/**
 * @class
 * Metaweb loader: Load data from freebase.com.
 *
 * <p>This is a loader for data from the Metaweb service at freebase.com. See
 * the API documentation at <a href="http://www.freebase.com/docs/mql/ch01.html">http://www.freebase.com/docs/mql/ch01.html</a> for
 * a description of how to write MQL queries. This code is based on code from
 * the API site.</p>
 *
 * @augments TimeMap.loaders.jsonp
 * @requires lib/json2.pack.js
 * @requires loaders/jsonp.js
 *
 * @example
TimeMap.init({
    datasets: [
        {
            title: "Freebase Dataset",
            type: "metaweb",
            options: {
                query: [
                    {
                      // query here - see Metaweb API
                    }
                ],
                transformFunction: function(data) {
                    // map returned data to the expected format - see
                    // http://code.google.com/p/timemap/wiki/JsonFormat
                    return data;
                }
            }
        }
    ],
    // etc...
});
 * @see <a href="../../examples/artists.html">Metaweb Example</a>
 *
 * @param {Object} options          All options for the loader
 * @param {Object} options.query                MQL query to load
 * @param {Function} options.transformFunction  Function to call on individual items before loading
 * @param {String} [options.host=http://www.freebase.com]   Host url of web service
 * @param {String} [options.service=/api/service/mqlread]   Path to web service on host
 * @param {mixed} [options[...]]    Other options (see {@link TimeMap.loaders.jsonp})
 */
TimeMap.loaders.metaweb = function(options) {
    var loader = new TimeMap.loaders.jsonp(options),
        q = options.query || {},
        // format the query URL for Metaweb
        querytext = encodeURIComponent(JSON.stringify({qname: {query: q}})),
        host = options.host || "http://www.freebase.com",
        service = options.service || "/api/service/mqlread";
    
    // set url
    loader.opts.url = host + service + "?queries=" + querytext + "&callback=?";
    
    /**
     * Preload function for Metaweb
     * @name TimeMap.loaders.metaweb#preload
     * @function
     * @parameter {Object} data     Data to preload
     * @return {Array} data         Array of item data
     */
    loader.preload = function(data) {
        // Open outer envelope
        var innerEnvelope = data.qname;
        // Make sure the query was successful
        if (innerEnvelope.code.indexOf("/api/status/ok") !== 0) {
            // uncomment for debugging
            /*
            // If error, get error message and throw
            var error = innerEnvelope.messages[0];
            throw error.code + ": " + error.message;
            */
            return [];
        }
        // Get result from inner envelope
        return innerEnvelope.result;
    };

    return loader;
};
