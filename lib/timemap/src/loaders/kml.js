/*
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */
 
/**
 * @fileOverview
 * KML Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */

/*globals TimeMap */

/**
 * @class
 * KML loader: load KML files.
 *
 * <p>This is a loader class for KML files. Currently supports all geometry
 * types (point, polyline, polygon, and overlay) and multiple geometries. Supports loading
 * <a href="http://code.google.com/apis/kml/documentation/extendeddata.html">ExtendedData</a>
 * through the extendedData parameter.
 * </p>
 *
 * @augments TimeMap.loaders.xml
 * @requires loaders/xml.js
 * @requires param.js
 * @borrows TimeMap.loaders.kml.parse as #parse
 *
 * @example
TimeMap.init({
    datasets: [
        {
            title: "KML Dataset",
            type: "kml",
            options: {
                url: "mydata.kml"   // Must be local
            }
        }
    ],
    // etc...
});
 * @see <a href="../../examples/kenya.html">KML Example</a>
 * @see <a href="../../examples/kml_extendeddata.html">KML ExtendedData Example</a>
 *
 * @param {Object} options          All options for the loader
 * @param {String} options.url              URL of KML file to load (NB: must be local address)
 * @param {String[]} [options.extendedData] Array of names for ExtendedData data elements
 * @param {mixed} [options[...]]            Other options (see {@link TimeMap.loaders.xml})
 * @return {TimeMap.loaders.xml}    Loader configured for KML
 */
TimeMap.loaders.kml = function(options) {
    var loader = new TimeMap.loaders.xml(options),
        tagMap = options.tagMap || {},
        extendedData = options.extendedData || [];
    
    // Add ExtendedData parameters to extra params
    extendedData.forEach(function(tagName) {
        loader.extraParams.push(
            new TimeMap.params.ExtendedDataParam(tagMap[tagName] || tagName, tagName)
        );
    });
    
    // set custom parser
    loader.parse = TimeMap.loaders.kml.parse;
    return loader;
};

/**
 * Static function to parse KML with time data.
 *
 * @param {XML} kml      KML node to be parsed
 * @return {TimeMapItem Array}  Array of TimeMapItems
 */
TimeMap.loaders.kml.parse = function(kmlnode) {
    var loader = this,
        items = [], 
        data, placemarks, nList, coords, pmobj;
    
    // get TimeMap utilty functions
    // assigning to variables should compress better
    var util = TimeMap.util,
        getTagValue = util.getTagValue,
        getNodeList = util.getNodeList,
        makePoint = util.makePoint,
        makePoly = util.makePoly,
        formatDate = util.formatDate;
    
    // recursive time data search
    function findNodeTime(n, data) {
        var tstamp = $(n).children("TimeStamp"),
            tspan = $(n).children("TimeSpan");
        // set start if found
        if (tspan.length) {
            data.start = getTagValue(tspan, 'begin');
            data.end = getTagValue(tspan, 'end')  ||
                // unbounded spans end at the present time
                formatDate(new Date());
        } else {
            data.start = getTagValue(tstamp, 'when');
        }
        // try looking recursively at parent nodes
        if (!data.start) {
            var $pn = $(n).parent();
            if ($pn.is("Folder") || $pn.is("Document")) {
                findNodeTime($pn, data);
            }
        }
    }
    
    // look for placemarks
    getNodeList(kmlnode, "Placemark").each(function() {
        var pm = this;
        data = { options: {} };
        // get title & description
        data.title = getTagValue(pm, "name");
        data.options.description = getTagValue(pm, "description");
        // get time information
        findNodeTime(pm, data);
        // find placemark(s)
        data.placemarks = [];
        // look for marker
        getNodeList(pm, "Point").each(function() {
            pmobj = { point: {} };
            // get lat/lon
            coords = getTagValue(this, "coordinates");
            pmobj.point = makePoint(coords, 1);
            data.placemarks.push(pmobj);
        });
        // look for polylines
        getNodeList(pm, "LineString").each(function() {
            pmobj = { polyline: [] };
            // get lat/lon
            coords = getTagValue(this, "coordinates");
            pmobj.polyline = makePoly(coords, 1);
            data.placemarks.push(pmobj);
        });
        // look for polygons
        getNodeList(pm, "Polygon").each(function() {
            pmobj = { polygon: [] };
            // get lat/lon
            coords = getTagValue(this, "coordinates");
            pmobj.polygon = makePoly(coords, 1);
            data.placemarks.push(pmobj);
        });
        // look for any extra tags and/or ExtendedData specified
        loader.parseExtra(data, pm);
        
        items.push(data);
    });
    
    // look for ground overlays
    getNodeList(kmlnode, "GroundOverlay").each(function() {
        var pm = this;
        data = { options: {}, overlay: {} };
        // get title & description
        data.title = getTagValue(pm, "name");
        data.options.description = getTagValue(pm, "description");
        // get time information
        findNodeTime(pm, data);
        // get image
        data.overlay.image = getTagValue(pm, "Icon href");
        // get coordinates
        nList = getNodeList(pm, "LatLonBox");
        data.overlay.north = getTagValue(nList, "north");
        data.overlay.south = getTagValue(nList, "south");
        data.overlay.east = getTagValue(nList, "east");
        data.overlay.west = getTagValue(nList, "west");
        // look for any extra tags and/or ExtendedData specified
        loader.parseExtra(data, pm);
        items.push(data);
    });
    
    // clean up
    kmlnode = null;
    
    return items;
};

/**
 * @class
 * Class for parameters loaded from KML ExtendedData elements
 *
 * @augments TimeMap.params.OptionParam
 *
 * @constructor
 * @param {String} paramName        String name of the parameter
 * @param {String} [tagName]        Tag name, if different
 */
TimeMap.params.ExtendedDataParam = function(paramName, tagName) {
    return new TimeMap.params.OptionParam(paramName, {
    
        /**
         * Set a config object based on an ExtendedData element
         * @name TimeMap.params.ExtendedDataParam#setConfigKML
         * @function
         * 
         * @param {Object} config       Config object to modify
         * @param {XML NodeList} node   Parent node to look for tags in
         */
        setConfigXML: function(config, node) {
            var util = TimeMap.util,
                param = this;
            util.getNodeList(node, "Data").each(function() {
                var $n = $(this);
                if ($n.attr("name") == tagName) {
                    param.setConfig(config, util.getTagValue($n, "value"));
                }
            });
        },
        
        sourceName: tagName
    
    });
};
