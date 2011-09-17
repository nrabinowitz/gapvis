/* 
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * Google Spreadsheet Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */

// for JSLint
/*global TimeMap, TimeMapItem */
 
/**
 * @class
 * Google Spreadsheet loader.
 *
 * <p>This is a loader for data from Google Spreadsheets. The constructor takes an optional map
 * to indicate which columns contain which data elements; the default column
 * names (case-insensitive) are: title, description, start, end, lat, lon</p>
 * 
 * <p>See <a href="http://code.google.com/apis/spreadsheets/docs/2.0/reference.html#gsx_reference">http://code.google.com/apis/spreadsheets/docs/2.0/reference.html#gsx_reference</a>
 * for details on how spreadsheet column ids are derived. Note that date fields 
 * must be in yyyy-mm-dd format - you may need to set the cell format as "plain text" 
 * in the spreadsheet (Google's automatic date formatting won't work).</p>
 *
 * <p>The loader takes either a full URL, minus the JSONP callback function, or 
 * just the spreadsheet key. Note that the spreadsheet must be published.</p>
 *
 * @augments TimeMap.loaders.jsonp
 * @requires param.js
 * @requires loaders/json.js
 *
 * @example
TimeMap.init({
    datasets: [
        {
            title: "Google Spreadsheet by key",
            type: "gss",
            options: {
                key: "pjUcDAp-oNIOjmx3LCxT4XA" // Spreadsheet key
            }
        },
        {
            title: "Google Spreadsheet by url",
            type: "gss",
            options: {
                url: "http://spreadsheets.google.com/feeds/list/pjUcDAp-oNIOjmx3LCxT4XA/1/public/values?alt=json-in-script&callback="
            }
        }
    ],
    // etc...
});
 * @see <a href="../../examples/google_spreadsheet.html">Google Spreadsheet Example</a>
 * @see <a href="../../examples/google_spreadsheet_columns.html">Google Spreadsheet Example, Arbitrary Columns</a>
 *
 * @param {Object} options          All options for the loader:
 * @param {String} options.key                      Key of spreadsheet to load, or
 * @param {String} options.url                      Full JSONP url of spreadsheet to load
 * @param {Object} [options.paramMap]               Map of paramName:columnName pairs for core parameters, 
 *                                                  if using non-standard column names; see keys in 
*                                                   {@link TimeMap.loaders.base#params} for the standard param names
 * @param {String[]} [options.extraColumns]         Array of additional columns to load; all named columns will be 
 *                                                  loaded into the item.opts object.
 * @param {mixed} [options[...]]    Other options (see {@link TimeMap.loaders.jsonp})
 */
TimeMap.loaders.gss = function(options) {
    var loader = new TimeMap.loaders.jsonp(options),
        params = loader.params, paramName, x,
        setParamField = TimeMap.loaders.gss.setParamField,
        paramMap = options.paramMap || {},
        extraColumns = options.extraColumns || [];
    
    // use key if no URL was supplied
    if (!loader.opts.url && options.key) {
        loader.opts.url = "http://spreadsheets.google.com/feeds/list/" + 
            options.key + "/1/public/values?alt=json-in-script&callback=?";
    }
    
    // Set up additional columns
    for (x=0; x < extraColumns.length; x++) {
        paramName = extraColumns[x];
        params[paramName] = new TimeMap.params.OptionParam(paramName);
    }
    
    // Set up parameters to work with Google Spreadsheets
    for (paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            fieldName = paramMap[paramName] || paramName;
            setParamField(params[paramName], fieldName);
        }
    }
    
    /**
     * Preload function for spreadsheet data
     * @name TimeMap.loaders.gss#preload
     * @function
     * @parameter {Object} data     Data to preload
     * @return {Array} data         Array of item data
     */
    loader.preload = function(data) {
        return data.feed.entry;
    };
    
    /**
     * Transform function for spreadsheet data
     * @name TimeMap.loaders.gss#transform
     * @function
     * @parameter {Object} data     Data to transform
     * @return {Object} data        Transformed data for one item
     */
    loader.transform = function(data) {
        var item = {}, params = loader.params, paramName,
            transform = options.transformFunction;
        // run through parameters, loading each
        for (paramName in params) {
            if (params.hasOwnProperty(paramName)) {
                params[paramName].setConfigGSS(item, data);
            }
        }
        // hook for further transformation
        if (transform) {
            item = transform(item);
        }
        return item;
    };

    return loader;
};

/**
 * Set a parameter to get its value from a given Google Spreadsheet field.
 *
 * @param {TimeMap.Param} param     Param object
 * @param {String} fieldName        Name of the field
 */
TimeMap.loaders.gss.setParamField = function(param, fieldName) {
    // internal function: Get the value of a Google Spreadsheet field
    var getField = function(data, fieldName) {
        // get element, converting field name to GSS format
        var el = data['gsx$' + fieldName.toLowerCase().replace(" ", "")];
        return el ? el.$t : null;
    };
    // set the method on the parameter
    param.setConfigGSS = function(config, data) {
        this.setConfig(config, getField(data, fieldName));
    };
};
