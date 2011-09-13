//-----------------------------------
// Monkey patches

// Throws an annoying error otherwise
SimileAjax.History.enabled = false;

// allow animations to be stopped
SimileAjax.Graphics._Animation.prototype.run = function() {
    var a = this;
    a.timeoutId = window.setTimeout(function() { a.step(); }, 50);
};
SimileAjax.Graphics._Animation.prototype.stop = function() {
    window.clearTimeout(this.timeoutId);
};

mxn.LatLonPoint.prototype.roughlyEquals = function(otherPoint, zoom) {
    function roughly(f) {
        return parseFloat(f).toFixed(~~(zoom/2))
    }
    return roughly(this.lat) == roughly(otherPoint.lat) 
        && roughly(this.lon)== roughly(otherPoint.lon);
};