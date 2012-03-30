var t = casper.test,
    baseUrl = "http://localhost:8080/",
    summaryUrl = baseUrl + '#book/2';

casper.start();

// Testing book summary page
casper
    .thenOpen(summaryUrl, function() {
        t.comment('Testing book summary page');
        t.assertAtBookSummaryView();
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book title shown");
        t.assertExists("#place-freq-bars-view > svg",
            "Frequency bars SVG found");
        t.assertEval(function() { return $("#place-freq-bars-view > svg rect").length > 6000 },
            "Frequency bars have been rendered");
        t.assertText("#book-summary-text-view span.place", 'Roma',
            "Top-frequency place is correct (span)");
        t.assertText("#place-freq-bars-view > svg text", 'Roma',
            "Top-frequency place is correct (bars)");
        t.assertExists('#book-summary-view div.navigation-view label[for^="nav-summary"].ui-state-active',
            'Book Summary button is active');
        t.assertEvalEquals(function() { return $('a.permalink').attr('href') }, baseUrl + '#book/2?pageview=text',
            "Permalink is correct");
    })
    .then(function() {
        t.comment('Testing book summary page > Links');
    })
    // nav button
    .then(function() {
        this.click('#book-summary-view div.navigation-view label[for^="nav-reading"]');
    })
    .then(function() {
        t.assertAtBookReadingView();
    })
    // Go to Reading View button
    .thenOpen(summaryUrl, function() {
        t.assertAtBookSummaryView();
        this.click('button.goto-reading');
    })
    .then(function() {
        t.assertAtBookReadingView();
    })
    // clicking on a place freq bar
    .thenOpen(summaryUrl, function() {
        t.assertAtBookSummaryView();
        this.click("#place-freq-bars-view > svg rect");
    })
    .then(function() {
        t.assertAtBookReadingView();
    })
    .waitUntilVisible('div.infowindow')
    .then(function() {
        t.assertInfoWindow('Roma', 'Roma is selected');
    })
    // clicking on a place on the map
    .thenOpen(summaryUrl, function() {
        t.assertAtBookSummaryView();
        // this is really ugly
        this.evaluate(function() {
            var marker = gv.app.currentView.children[3].markers[0];
            google.maps.event.trigger(marker, 'click');
        });
    })
    .then(function() {
        t.assertAtBookPlaceView();
        t.assertText('#place-summary-view h3', 'Roma', 'Roma is selected');
    });

casper.run(function() {
    t.done();
});