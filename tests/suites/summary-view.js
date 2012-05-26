var t = casper.test,
    baseUrl = "http://localhost:8080/",
    summaryUrl = baseUrl + '#book/2';
    
casper.start();

// Basic page tests
casper
    .describe('Book summary page')
    .thenOpen(summaryUrl)
    .assertAtBookSummaryView()
    .then(function() {
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book title shown");
        t.assertExists("div.right-panel div svg",
            "Frequency bars SVG found");
        t.assertEval(function() { return $("div.right-panel div svg rect").length > 6000 },
            "Frequency bars have been rendered");
        t.assertText("div.text-slot span.place", 'Roma',
            "Top-frequency place is correct (span)");
        t.assertText("div.right-panel div svg text", 'Roma',
            "Top-frequency place is correct (bars)");
        t.assertVisible('div.navigation-view button[data-view-id="book-summary"].active',
            'Book Summary button is active');
        t.assertPermalink(RegExp(baseUrl + '#book/2\\?'),
            "Permalink is correct");
    });
    
casper
    .describe('Book summary page > Nav button')
    .thenOpen(summaryUrl)
    .assertAtBookSummaryView()
    .then(function() {
        this.click('div.navigation-view button[data-view-id="reading-view"]');
    })
    .assertAtBookReadingView();
    
casper
    .describe('Book summary page > Go To Reading View button')
    .thenOpen(summaryUrl)
    .assertAtBookSummaryView()
    .then(function() {
        this.click('button.goto-reading');
    })
    .assertAtBookReadingView();

casper
    .describe('Book summary page > Freq bars click')
    .thenOpen(summaryUrl)
    .assertAtBookSummaryView()
    .then(function() {
        this.click("div.right-panel div svg rect");
    })
    .assertAtBookReadingView()
    .waitForInfoWindow()
    .then(function() {
        t.assertInfoWindow('Roma', 'Roma is selected');
    });
    
casper
    .describe('Book summary page > Map items')
    .thenOpen(summaryUrl)
    .assertAtBookSummaryView()
    .then(function() {
        // this is ugly
        t.assertEval(function() { return gv.app.currentView.slots['.left-panel'].markers.length > 10; },
            "Some markers are loaded on the map");
        // this is really ugly
        this.evaluate(function() {
            var marker = gv.app.currentView.slots['.left-panel'].markers[0];
            google.maps.event.trigger(marker, 'click');
        });
    })
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText('.place-summary-view h3', 'Roma', 'Roma is selected');
    });

casper.run(function() {
    t.done();
});