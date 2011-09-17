/* 
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * Flickr Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */
 
// for JSLint
/*global TimeMap */

/**
 * @class
 * Flickr loader: Load JSONP data from Flickr. 
 *
 * <p>This is a loader for Flickr data. You probably want to use it with a
 * URL for the Flickr Geo Feed API: <a href="http://www.flickr.com/services/feeds/geo/">http://www.flickr.com/services/feeds/geo/</a></p>
 *
 * <p>The loader takes a full URL, minus the JSONP callback function.</p>
 *
 * @augments TimeMap.loaders.jsonp
 * @requires loaders/json.js
 *
 * @example
TimeMap.init({
    datasets: [
        {
            title: "Flickr Dataset",
            type: "flickr",
            options: {
                // This is just the latest geotagged photo stream - try adding
                // an "id" or "tag" or "photoset" parameter to get what you want
                url: "http://www.flickr.com/services/feeds/geo/?format=json&jsoncallback=?"
            }
        }
    ],
    // etc...
});
 * @see <a href="../../examples/pathlines.html">Flickr Pathlines Example</a>
 *
 * @param {Object} options          All options for the loader
 * @param {String} options.url          Full JSONP url of Flickr feed to load
 * @param {mixed} [options[...]]        Other options (see {@link TimeMap.loaders.jsonp})
 */
TimeMap.loaders.flickr = function(options) {
    var loader = new TimeMap.loaders.jsonp(options);
    
    // set ajax settings for loader
    loader.opts.jsonp = 'jsoncallback';
    
    /**
     * Preload function for Flickr feeds
     * @name TimeMap.loaders.flickr#preload
     * @function
     * @parameter {Object} data     Data to preload
     * @return {Array} data         Array of item data
     */
    loader.preload = function(data) {
        return data.items;
    };
    
    /**
     * Transform function for Flickr feeds
     * @name TimeMap.loaders.flickr#transform
     * @function
     * @parameter {Object} data     Data to transform
     * @return {Object} data        Transformed data for one item
     */
    loader.transform = function(data) {
        var item = {
            title: data.title,
            start: data.date_taken,
            point: {
                lat: data.latitude,
                lon: data.longitude
            },
            options: {
                description: data.description
                    .replace(/&gt;/g, ">")
                    .replace(/&lt;/g, "<")
                    .replace(/&quot;/g, '"')
            }
        };
        if (options.transformFunction) {
            item = options.transformFunction(item);
        }
        return item;
    };

    return loader;
};
