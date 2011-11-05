// let d3 fail gracefully in older IE versions
(function(window) {
    if (!window.CSSStyleDeclaration) {
        var shim = window.CSSStyleDeclaration = function() {};
        shim.prototype.setProperty = function() {};
        // flag: don't use d3
        window.nod3 = true;
    }
})(this);