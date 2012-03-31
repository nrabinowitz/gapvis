// Tests require PhantomJS and Casper.js

var casper = require('casper').create({
        viewportSize: {width: 800, height: 600}
    }),
    t = casper.test,
    baseUrl = "http://localhost:8080/";
    
// for easier syntax
casper.describe = function(msg) {
    if (this.started) {
        this.then(function() { t.comment(msg) });
        // let's clear the page state while we're at it
        this.thenOpen('about:blank');
    } else {
        t.comment(msg);
    }
    return this;
};

// helpers

casper.closeInfoWindow = function() {
    // no way to easily access the close button
    this.evaluate(function() { 
        gv.app.currentView.children[3].tm.map.closeBubble(); 
    });
};
    
// extend the tester with some custom assertions

t.assertText = function(selector, expected, message) {
    f = new Function("return $('" + selector + "').first().text().trim()");
    t.assertEvalEquals(f, expected, message);
}

t.assertInText = function(selector, expected, message) {
    f = new Function("return $('" + selector + "').first().text().trim()");
    var text = casper.evaluate(f);
    t.assert(text.indexOf(expected) >= 0, message);
}

t.assertVisible = function(selector, message) {
    f = new Function("return !!$('" + selector + ":visible').length")
    t.assertEval(f, message);
}
t.assertNotVisible = function(selector, message) {
    f = new Function("return !$('" + selector + ":visible').length")
    t.assertEval(f, message);
}
t.assertDoesNotExist = function(selector, message) {
    f = new Function("return !$('" + selector + "').length")
    t.assertEval(f, message);
}

t.assertRoute = function(expected, message) {
    var getHash = function() {
        return window.location.hash.substr(1);
    };
    if (expected instanceof RegExp) {
        t.assertMatch(casper.evaluate(getHash), expected, message);
    } else {
        t.assertEvalEquals(getHash, expected, message);
    }
};

t.assertInfoWindow = function(expected, message) {
    t.assertVisible('div.infowindow', "Info window is open");
    t.assertText('div.infowindow h3', expected + ' (Zoom In)', message);
};

t.assertPermalink = function(expected, message) {
    var permalink = casper.evaluate(function() { return $('a.permalink:visible').attr('href') });
    t.assertMatch(permalink, expected, message);
}

// bundled assertions

t.assertAtIndexView = function() {
    t.assertRoute('index', "Index route correct");
    t.assertVisible('#index-view', "Index view is visible");
}
t.assertAtBookSummaryView = function() {
    t.assertRoute(/^book\/\d+/, 'Book Summary route correct');
    t.assertVisible('#book-summary-view', "Book Summary view is visible");
}
t.assertAtBookReadingView = function() {
    t.assertRoute(/^book\/\d+\/read/, 'Book reading route correct');
    t.assertVisible('#book-view', "Book Reading view is visible");
}
t.assertAtBookPlaceView = function() {
    t.assertRoute(/^book\/\d+\/place\/\d+/, 'Place Detail route correct');
    t.assertVisible('#book-place-view', "Place Detail view is visible");
}

// set up and run suites
var fs = require('fs'),
    tests = [];

if (casper.cli.args.length) {
    tests = casper.cli.args.filter(function(path) {
        return fs.isFile(path) || fs.isDirectory(path);
    });
} else {
    casper.echo('No test path passed, exiting.', 'RED_BAR', 80);
    casper.exit(1);
}

t.on('tests.complete', function() {
    this.renderResults(true);
});

t.runSuites.apply(casper.test, tests);