/*
 * Timemap.js Copyright 2010 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * Additional TimeMap manipulation functions.
 * Functions in this file are used to manipulate a TimeMap, TimeMapDataset, or
 * TimeMapItem after the initial load process.
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */
 
(function(){
    var window = this,
        TimeMap = window.TimeMap, 
        TimeMapDataset = window.TimeMapDataset, 
        TimeMapItem = window.TimeMapItem,
        util = TimeMap.util;
        
/*----------------------------------------------------------------------------
 * TimeMap manipulation: stuff affecting every dataset
 *---------------------------------------------------------------------------*/

// XXX: This should $.extend the prototype, I think
 
/**
 * Delete all datasets, clearing them from map and timeline. Note
 * that this is more efficient than calling clear() on each dataset.
 */
TimeMap.prototype.clear = function() {
    var tm = this;
    tm.eachItem(function(item) {
        item.event = item.placemark = null;
    });
    tm.map.removeAllPolylines();
    tm.map.removeAllMarkers();
    tm.eventSource.clear();
    tm.datasets = [];
};

/**
 * Delete one dataset, clearing it from map and timeline
 *
 * @param {String} id    Id of dataset to delete
 */
TimeMap.prototype.deleteDataset = function(id) {
    this.datasets[id].clear();
    delete this.datasets[id];
};

/**
 * Hides placemarks for a given dataset
 * 
 * @param {String} id   The id of the dataset to hide
 */
TimeMap.prototype.hideDataset = function (id){
    if (id in this.datasets) {
        this.datasets[id].hide();
    }
};

/**
 * Hides all the datasets on the map
 */
TimeMap.prototype.hideDatasets = function(){
    var tm = this;
    tm.each(function(ds) {
        ds.visible = false;
    });
    tm.filter("map");
    tm.filter("timeline");
};

/**
 * Shows placemarks for a given dataset
 * 
 * @param {String} id   The id of the dataset to hide
 */
TimeMap.prototype.showDataset = function(id) {
    if (id in this.datasets) {
        this.datasets[id].show();
    }
};

/**
 * Shows all the datasets on the map
 */
TimeMap.prototype.showDatasets = function() {
    var tm = this;
    tm.each(function(ds) {
        ds.visible = true;
    });
    tm.filter("map");
    tm.filter("timeline");
};
 
/**
 * Change the default map type
 *
 * @param {String} mapType   The maptype for the map (see {@link TimeMap.mapTypes} for options)
 */
TimeMap.prototype.changeMapType = function (mapType) {
    var tm = this;
    // check for no change
    if (mapType == tm.opts.mapType) {
        return;
    }
    // look for mapType
    if (typeof(mapType) == 'string') {
        mapType = TimeMap.mapTypes[mapType];
    }
    // no mapType specified
    if (!mapType) {
        return;
    }
    // change it
    tm.opts.mapType = mapType;
    tm.map.setMapType(mapType);
};

/*----------------------------------------------------------------------------
 * TimeMap manipulation: stuff affecting the timeline
 *---------------------------------------------------------------------------*/

/**
 * Refresh the timeline, maintaining the current date
 */
TimeMap.prototype.refreshTimeline = function () {
    var topband = this.timeline.getBand(0);
    var centerDate = topband.getCenterVisibleDate();
    if (util.TimelineVersion() == "1.2") {
        topband.getEventPainter().getLayout()._laidout = false;
    }
    this.timeline.layout();
    topband.setCenterVisibleDate(centerDate);
};

/**
 * Change the intervals on the timeline.
 *
 * @param {String|Array} intervals   New intervals. If string, looks up in TimeMap.intervals.
 */
TimeMap.prototype.changeTimeIntervals = function (intervals) {
    var tm = this;
    // check for no change or no intervals
    if (!intervals || intervals == tm.opts.bandIntervals) {
        return;
    }
    // resolve string references if necessary
    intervals = util.lookup(intervals, TimeMap.intervals);
    tm.opts.bandIntervals = intervals;
    // internal function - change band interval
    function changeInterval(band, interval) {
        band.getEther()._interval = Timeline.DateTime.gregorianUnitLengths[interval];
        band.getEtherPainter()._unit = interval;
    }
    // grab date
    var topband = tm.timeline.getBand(0),
        centerDate = topband.getCenterVisibleDate(),
        x;
    // change interval for each band
    for (x=0; x<tm.timeline.getBandCount(); x++) {
        changeInterval(tm.timeline.getBand(x), intervals[x]);
    }
    // re-layout timeline
    if (topband.getEventPainter().getLayout) {
        topband.getEventPainter().getLayout()._laidout = false;
    }
    tm.timeline.layout();
    topband.setCenterVisibleDate(centerDate);
};


/*----------------------------------------------------------------------------
 * TimeMapDataset manipulation: global settings, stuff affecting every item
 *---------------------------------------------------------------------------*/

/**
 * Delete all items, clearing them from map and timeline
 */
TimeMapDataset.prototype.clear = function() {
    var ds = this;
    ds.each(function(item) {
        item.clear(true);
    });
    ds.items = [];
    ds.timemap.timeline.layout();
};

/**
 * Delete one item, clearing it from map and timeline
 * 
 * @param {TimeMapItem} item      Item to delete
 */
TimeMapDataset.prototype.deleteItem = function(item) {
    var ds = this, x;
    for (x=0; x < ds.items.length; x++) {
        if (ds.items[x] == item) {
            item.clear();
            ds.items.splice(x, 1);
            break;
        }
    }
};

/**
 * Show dataset
 */
TimeMapDataset.prototype.show = function() {
    var ds = this,
        tm = ds.timemap;
    if (!ds.visible) {
        ds.visible = true;
        tm.filter("map");
        tm.filter("timeline");
    }
};

/**
 * Hide dataset
 */
TimeMapDataset.prototype.hide = function() {
    var ds = this,
        tm = ds.timemap;
    if (ds.visible) {
        ds.visible = false;
        tm.filter("map");
        tm.filter("timeline");
    }
};

 /**
 * Change the theme for every item in a dataset
 *
 * @param {TimeMapTheme|String} theme   New theme, or string key in {@link TimeMap.themes}
 */
 TimeMapDataset.prototype.changeTheme = function(newTheme) {
    var ds = this;
    newTheme = util.lookup(newTheme, TimeMap.themes);
    ds.opts.theme = newTheme;
    ds.each(function(item) {
        item.changeTheme(newTheme, true);
    });
    ds.timemap.timeline.layout();
 };
 
 
/*----------------------------------------------------------------------------
 * TimeMapItem manipulation: manipulate events and placemarks
 *---------------------------------------------------------------------------*/

/** 
 * Show event and placemark
 */
TimeMapItem.prototype.show = function() {
    var item = this;
    item.showEvent();
    item.showPlacemark();
    item.visible = true;
};

/** 
 * Hide event and placemark
 */
TimeMapItem.prototype.hide = function() {
    var item = this;
    item.hideEvent();
    item.hidePlacemark();
    item.visible = false;
};

/**
 * Delete placemark from map and event from timeline
 * @param [suppressLayout]      Whether to suppress laying out the timeline 
 *                              (e.g. for batch operations)
 */
TimeMapItem.prototype.clear = function(suppressLayout) {
    var item = this,
        i;
    // remove event
    if (item.event) {
        // this is just ridiculous
        item.dataset.timemap.timeline.getBand(0)
            .getEventSource()._events._events.remove(item.event);
        if (!suppressLayout) {
            item.timeline.layout();
        }
    }
    // remove placemark
    function removeOverlay(p) {
        try {
            if (item.getType() == 'marker') {
                item.map.removeMarker(p);
            } 
            else {
                item.map.removePolyline(p);
            }
        } catch(e) {}
    }
    if (item.placemark) {
        item.hidePlacemark();
        if (item.getType() == "array") {
            item.placemark.forEach(removeOverlay);
        } else {
            removeOverlay(item.placemark);
        }
    }
    item.event = item.placemark = null;
};

 /**
 * Create a new event for the item.
 * 
 * @param {Date} start      Start date for the event
 * @param {Date} [end]      End date for the event
 */
TimeMapItem.prototype.createEvent = function(start, end) {
    var item = this,
        theme = item.opts.theme,
        instant = (end === undefined),
        title = item.getTitle();
    // create event
    var event = new Timeline.DefaultEventSource.Event(start, end, null, null, instant, title, 
        null, null, null, theme.eventIcon, theme.eventColor, null);
    // add references
    event.item = item;
    item.event = event;
    item.dataset.eventSource.add(event);
    item.timeline.layout();
};
 
 /**
 * Change the theme for an item
 *
 * @param {TimeMapTheme|String} theme   New theme, or string key in {@link TimeMap.themes}
 * @param [suppressLayout]      Whether to suppress laying out the timeline 
 *                              (e.g. for batch operations)
 */
 TimeMapItem.prototype.changeTheme = function(newTheme, suppressLayout) {
    var item = this,
        type = item.getType(),
        event = item.event,
        placemark = item.placemark,
        i;
    newTheme = util.lookup(newTheme, TimeMap.themes);
    item.opts.theme = newTheme;
    // internal function - takes type, placemark
    function changePlacemark(pm) {
        pm.addData(newTheme);
        // XXX: Need to update this in Mapstraction - most implementations not available
        pm.update();
    }
    // change placemark
    if (placemark) {
        if (type == 'array') {
            placemark.forEach(changePlacemark);
        } else {
            changePlacemark(placemark);
        }
    }
    // change event
    if (event) {
        event._color = newTheme.eventColor;
        event._icon = newTheme.eventIcon;
        if (!suppressLayout) {
            item.timeline.layout();
        }
    }
};


/** 
 * Find the next or previous item chronologically
 *
 * @param {Boolean} [backwards=false]   Whether to look backwards (i.e. find previous) 
 * @param {Boolean} [inDataset=false]   Whether to only look in this item's dataset
 * @return {TimeMapItem}                Next/previous item, if any
 */
TimeMapItem.prototype.getNextPrev = function(backwards, inDataset) {
    var item = this,
        eventSource = item.dataset.timemap.timeline.getBand(0).getEventSource(),
        // iterator dates are non-inclusive, hence the juggle here
        i = backwards ? 
            eventSource.getEventReverseIterator(
                new Date(eventSource.getEarliestDate().getTime() - 1),
                item.event.getStart()) :
            eventSource.getEventIterator(
                item.event.getStart(), 
                new Date(eventSource.getLatestDate().getTime() + 1)
            ),
        next = null;
    if (!item.event) {
        return;
    }
    while (next === null) {
        if (i.hasNext()) {
            next = i.next().item;
            if (inDataset && next.dataset != item.dataset) {
                next = null;
            }
        } else {
            break;
        }
    }
    return next;
};

/** 
 * Find the next item chronologically
 *
 * @param {Boolean} [inDataset=false]   Whether to only look in this item's dataset
 * @return {TimeMapItem}                Next item, if any
 */
TimeMapItem.prototype.getNext = function(inDataset) {
    return this.getNextPrev(false, inDataset);
};

/** 
 * Find the previous item chronologically
 *
 * @requires Timeline v.2.2.0 or greater
 *
 * @param {Boolean} [inDataset=false]   Whether to only look in this item's dataset
 * @return {TimeMapItem}                Next item, if any
 */
TimeMapItem.prototype.getPrev = function(inDataset) {
    return this.getNextPrev(true, inDataset);
};

})();