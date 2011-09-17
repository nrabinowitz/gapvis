/*
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */
 
/**
 * @fileOverview
 * GeoRSS Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */

/*globals TimeMap, TimeMapDataset */

/**
 * @class
 * GeoRSS loader: Load GeoRSS feeds.
 *
 * <p> Parsing is complicated by the 
 * diversity of GeoRSS formats; this parser handles:</p>
 * <ul>
 *  <li>RSS feeds</li>
 *  <li>Atom feeds</li>
 * </ul>
 * <p>and looks for geographic information in the following formats:</p>
 * <ul>
 *  <li>GeoRSS-Simple</li>
 *  <li>GML </li>
 *  <li>W3C Geo</li>
 * </ul>
 * <p>At the moment, this only supports points, polygons, polylines; boxes
 * may be added at some later point.</p>
 *
 * @augments TimeMap.loaders.xml
 * @requires loaders/xml.js
 * @requires param.js
 * @borrows TimeMap.loaders.georss.parse as #parse
 *
 * @example
TimeMap.init({
    datasets: [
        {
            title: "GeoRSS Dataset",
            type: "georss", // Data to be loaded in GeoRSS
            options: {
                url: "mydata.rss" // GeoRSS file to load - must be a local URL
            }
        }
    ],
    // etc...
});
 * @see <a href="../../examples/earthquake_georss.html">GeoRSS Example</a>
 *
 * @param {Object} options          All options for the loader:
 * @param {String} options.url          URL of GeoRSS file to load (NB: must be local address)
 * @param {mixed} [options[...]]        Other options (see {@link TimeMap.loaders.xml})
 */
TimeMap.loaders.georss = function(options) {
    var loader = new TimeMap.loaders.xml(options);
    loader.parse = TimeMap.loaders.georss.parse;
    return loader;
};

/**
 * Static function to parse GeoRSS
 *
 * @param {XML} node      GeoRSS node to be parsed
 * @return {TimeMapItem[]}  Array of TimeMapItems
 */
TimeMap.loaders.georss.parse = function(node) {
    var items = [], data, placemarks, pm, i, nList;
    
    // get TimeMap utilty functions
    // assigning to variables should compress better
    var util = TimeMap.util,
        getTagValue = util.getTagValue,
        getNodeList = util.getNodeList,
        makePoint = util.makePoint,
        makePoly = util.makePoly,
        formatDate = util.formatDate,
        nsMap = util.nsMap;
    
    // define namespaces
    nsMap.georss = 'http://www.georss.org/georss';
    nsMap.gml = 'http://www.opengis.net/gml';
    nsMap.geo = 'http://www.w3.org/2003/01/geo/wgs84_pos#';
    nsMap.kml = 'http://www.opengis.net/kml/2.2';
    
    // determine whether this is an Atom feed or an RSS feed
    var feedType = (node.firstChild.tagName == 'rss') ? 'rss' : 'atom';
    
    // look for placemarks
    var tName = (feedType == 'rss' ? "item" : "entry");
    placemarks = getNodeList(node, tName);
    for (i=0; i<placemarks.length; i++) {
        pm = placemarks[i];
        data = { options: {} };
        // get title & description
        data.title = getTagValue(pm, "title");
        tName = (feedType == 'rss' ? "description" : "summary");
        data.options.description = getTagValue(pm, tName);
        // get time information, allowing KML-namespaced time elements
        nList = getNodeList(pm, "TimeStamp", "kml");
        if (nList.length > 0) {
            data.start = getTagValue(nList[0], "when", "kml");
        }
        // look for timespan
        if (!data.start) {
            nList = getNodeList(pm, "TimeSpan", "kml");
            if (nList.length > 0) {
                data.start = getTagValue(nList[0], "begin", "kml");
                data.end = getTagValue(nList[0], "end", "kml") ||
                    // unbounded spans end at the present time
                    formatDate(new Date());
            }
        }
        // otherwise, use pubDate/updated elements
        if (!data.start) {
            if (feedType == 'rss') {
                // RSS needs date conversion
                var d = new Date(Date.parse(getTagValue(pm, "pubDate")));
                // reformat
                data.start = formatDate(d);
            } else {
                // atom uses ISO 8601
                data.start = getTagValue(pm, "updated");
            }
        }
        // find placemark - single geometry only for the moment
        var done = false;
        PLACEMARK: while (!done) {
            var coords, geom;
            // look for point, GeoRSS-Simple
            coords = getTagValue(pm, "point", 'georss');
            if (coords) {
                data.point = makePoint(coords); 
                break PLACEMARK;
            }
            // look for point, GML
            nList = getNodeList(pm, "Point", 'gml');
            if (nList.length > 0) {
                // GML <pos>
                coords = getTagValue(nList[0], "pos", 'gml');
                // GML <coordinates>
                if (!coords) {
                    coords = getTagValue(nList[0], "coordinates", 'gml');
                }
                if (coords) {
                    data.point = makePoint(coords); 
                    break PLACEMARK;
                }
            }
            // look for point, W3C Geo
            if (getTagValue(pm, "lat", 'geo')) {
                coords = [
                    getTagValue(pm, "lat", 'geo'),
                    getTagValue(pm, "long", 'geo')
                ];
                data.point = makePoint(coords); 
                break PLACEMARK;
            }
            // look for polyline, GeoRSS-Simple
            coords = getTagValue(pm, "line", 'georss');
            if (coords) {
                data.polyline = makePoly(coords); 
                break PLACEMARK;
            }
            // look for polygon, GeoRSS-Simple
            coords = getTagValue(pm, "polygon", 'georss');
            if (coords) {
                data.polygon = makePoly(coords); 
                break PLACEMARK;
            }
            // look for polyline, GML
            nList = getNodeList(pm, "LineString", 'gml');
            if (nList.length > 0) {
                geom = "polyline";
            } else {
                nList = getNodeList(pm, "Polygon", 'gml');
                if (nList.length > 0) {
                    geom = "polygon";
                }
            }
            if (nList.length > 0) {
                // GML <posList>
                coords = getTagValue(nList[0], "posList", 'gml');
                // GML <coordinates>
                if (!coords) {
                    coords = getTagValue(nList[0], "coordinates", 'gml');
                }
                if (coords) {
                    data[geom] = makePoly(coords);
                    break PLACEMARK;
                }
            }
            
            // XXX: deal with boxes
            
            done = true;
        }
        // look for any extra tags specified
        this.parseExtra(data, pm);
        items.push(data);
    }
    
    // clean up
    node = placemarks = pm = nList = null;
    return items;
};
