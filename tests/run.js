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

casper.waitForSelector = function(selector, msg, negate) {
    this.waitFor(function() {
        var toBool = negate ? '!' : '!!';
            f = new Function("return " + toBool + "$('" + selector + ":visible').length");
        return casper.evaluate(f)
    }, function() {
        t.pass(msg || 'Selector ' + selector + ' found');
    },  function() {
        t.fail(msg || 'Selector ' + selector + ' not found');
    });
    return this;
};

casper.waitForInfoWindow = function(msg) {
    return this.waitForSelector('div.infowindow', msg || "Info window is open");
};
casper.waitForInfoWindowClose = function(msg) {
    return this.waitForSelector('div.infowindow', msg || "Info window is closed", true);
};

casper.closeInfoWindow = function() {
    // no way to easily access the close button
    this.evaluate(function() { 
        gv.app.currentView.slots['.right-panel'].slots['.top-slot'].tm.map.closeBubble(); 
    });
    return this;
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

// Assertions about app-specific UI components
t.assertInfoWindow = function(expected, message) {
    t.assertText('div.infowindow h3', expected + ' (Zoom In)', message);
};

t.assertPermalink = function(expected, message) {
    var permalink = casper.evaluate(function() { return $('a.permalink:visible').attr('href') });
    t.assertMatch(permalink, expected, message);
}

t.assertMessage = function(expected, message) {
    t.assertVisible('#message-view .alert span',
        "Message is shown");
    var text = casper.evaluate(function() { 
        return $('#message-view .alert span').text().trim(); 
    });
    if (expected instanceof RegExp) {
        t.assertMatch(text, expected, message);
    } else {
        t.assertEquals(text, expected, message);
    }
}

// bundled assertions

casper.assertAtView = function(viewName, route, view, selector) {
    selector = selector || view;
    this.waitForSelector('div.top.' + selector, viewName + " is visible")
        .then(function() {
            t.assertEvalEquals(function() { return gv.state.get('view'); }, view,
                "State set correctly for " + viewName);
            t.assertRoute(route, 
                "Route correct for " + viewName);
        });
    return this;
};
casper.assertAtIndexView = function() {
    return this.assertAtView("Index view", 'index', 'index', 'index-view');
};
casper.assertAtBookSummaryView = function() {
    return this.assertAtView("Book summary", /^book\/\d+/, 'book-summary', 'summary-view');
};
casper.assertAtBookReadingView = function() {
    return this.assertAtView("Reading view", /^book\/\d+\/read/, 'reading-view');
};
casper.assertAtBookPlaceView = function() {
    return this.assertAtView("Place detail view", /^book\/\d+\/place\/\d+/, 'place-view');
};

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