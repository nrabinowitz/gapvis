var t = casper.test,
    baseUrl = "http://localhost:8080/",
    summaryUrl = baseUrl + '#book/2';
    
casper.start();

// Basic page tests
casper
    .describe('Book summary page')
    .thenOpen(summaryUrl, function() {
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
        t.assertPermalink(RegExp(baseUrl + '#book/2\\?'),
            "Permalink is correct");
    });
    
casper
    .describe('Book summary page > Nav button')
    .thenOpen(summaryUrl, function() {
        this.click('#book-summary-view div.navigation-view label[for^="nav-reading"]');
    })
    .then(function() {
        t.assertAtBookReadingView();
    });
    
casper
    .describe('Book summary page > Go To Reading View button')
    .thenOpen(summaryUrl, function() {
        t.assertAtBookSummaryView();
        this.click('button.goto-reading');
    })
    .then(function() {
        t.assertAtBookReadingView();
    });

casper
    .describe('Book summary page > Freq bars click')
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
    });
    
casper
    .describe('Book summary page > Map item click')
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