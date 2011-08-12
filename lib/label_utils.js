/**
 * @class
 * This is a utility class for making a timeline from an array of
 * labels, rather than based on chronology.
 *
 * @constructor
 * @param {Object[]} bandInfo   Timeline band info array
 * @param {String[]} labels     The labels to use for the timeline
 * @param {Function} emphasize  Function taking a label and returning true if it
 *                              should be emphasized.
 */
LabelUtils = function(bandInfo, labels, emphasize) {
    
    /**
     * Labels for the timeline.
     * @type String[]
     */
    this.labels = labels;
    
    /**
     * Function taking a label and returning true if it should be emphasized.
     * @type Function
     */
    this.emphasize = emphasize;
    
    var utils = this;
    /**
     * Custom labeller for timeline bands
     */
    this.labeller = {
        labelInterval: function(date, intervalUnit) {
            var label = utils.dateToLabel(date);
            return {
                text: label,
                emphasized: emphasize(label)
            };
        }
    };
    
    // set up start/end for timeline
    // XXX: should this be optional?
    var start = new Date(),
        stop = new Date();
    start.setUTCFullYear(-1);
    stop.setUTCFullYear(this.labels.length + 1);
    
    // add labeller to bandInfo
    for (var x=0; x<bandInfo.length; x++) {
        bandInfo[x].labeller = this.labeller;
        if (!bandInfo[x].theme) {
            bandInfo[x].theme = Timeline.ClassicTheme.create();
        }
        bandInfo[x].theme.timeline_start = start;
        bandInfo[x].theme.timeline_stop  = stop;
    }
};

/**
 * Utility function to get start date
 */
LabelUtils.prototype.getStartDate = function() {
    var zeroDate = new Date();
    zeroDate.setUTCFullYear(0);
    return zeroDate;
};

/**
 * Utility function to get end date
 */
LabelUtils.prototype.getEndDate = function() {
    var endDate = new Date();
    endDate.setUTCFullYear(this.labels.length-1);
    return endDate;
};
    
/**
 * Utility function to locate a label in the label array.
 *
 * @param {String} label        Label to locate
 */
LabelUtils.prototype.getLabelIndex = function(label) {
    var labels = this.labels, i = labels.length;
    // check for indexOf support - FF/Chrome only
    if (labels.indexOf) {
        return labels.indexOf(label);
    }
    // otherwise, do it the hard way
    while (--i) {
        if (labels[i]==label) break;
    }
    return i;
};

/**
 * Translate label labelition to date
 *
 * @param {String} label    Label to translate to date
 * @return {Date}           Date for use on timeline, or null if not found
 */
LabelUtils.prototype.labelToDate = function(label) {
    var d = new Date(),
        year = this.getLabelIndex(label);
    if (year >= 0) {
        d.setUTCFullYear(year);
    } else {
        // not found
        d = null;
    }
    return d;
};

/**
 * Translate date to label position 
 *
 * @param {Date} d      Date for use on timeline
 * @return {String}     Corresponding label
 *         
 */
LabelUtils.prototype.dateToLabel = function(d) {
    var year = d.getUTCFullYear();
    if (year >= 0 && year < this.labels.length) {
        return this.labels[year];
    }
    return "";
};