var t = casper.test,
    baseUrl = "http://localhost:8080/",
    summaryUrl = baseUrl;
    
casper.start();

casper
    .describe('Reading view, then switch books')
    .thenOpen(baseUrl + '#book/2/read/2')
    .assertAtBookReadingView()
    .then(function() {
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book 2 title shown");
    })
    .then(function() {
        casper.click('header h1 a');
    })
    .assertAtIndexView()
    .then(function() {
        this.click('div.book-list p:nth-child(2) span');
    })
    .assertAtBookSummaryView()
    .then(function() {
        t.assertText("h2.book-title", 'The History of the Peloponnesian War',
            "Book 3 title shown");
    });

casper
    .describe('Open Info window, then switch books')
    .thenOpen(baseUrl + '#book/2/read/2/423025')
    .assertAtBookReadingView()
    .then(function() {
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book 2 title shown");
    })
    .waitForInfoWindow()
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/2\/423025/, 'Reading route with place correct');
        t.assertInfoWindow('Roma', 'Roma is selected in info window');
    })
    .then(function() {
        casper.click('header h1 a');
    })
    .assertAtIndexView()
    .then(function() {
        casper.click('div.book-list p:nth-child(2) span');
    })
    .assertAtBookSummaryView()
    .then(function() {
        t.assertText("h2.book-title", 'The History of the Peloponnesian War',
            "Book 3 title shown");
    });
    
casper
    .describe('Switch books, check map')
    .thenOpen(baseUrl + '#book/2/read/2')
    .assertAtBookReadingView()
    .then(function() {
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book 2 title shown");
    })
    .then(function() {
        casper.click('header h1 a');
    })
    .assertAtIndexView()
    .then(function() {
        casper.click('div.book-list p:nth-child(2) span');
    })
    .assertAtBookSummaryView()
    .then(function() {
        t.assertText("h2.book-title", 'The History of the Peloponnesian War',
            "Book 3 title shown");
    })
    .then(function() {
        casper.click('button.goto-reading');
    })
    .assertAtBookReadingView()
    .then(function() {
        t.assertEval(function() { 
            return gv.app.currentView.slots['.right-panel'].slots['.top-slot'].tm.map.getZoom() > 0
        },
            "Map isn't screwed up");
    });
    
casper
    .describe('Forward/back, check map')
    .thenOpen(baseUrl + '#book/2/read/2/423025')
    .assertAtBookReadingView()
    .then(function() {
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book 2 title shown");
    })
    .waitForInfoWindow()
    .then(function() {
        casper.click('.navigation-view button[data-view-id="place-view"]');
    })
    .assertAtBookPlaceView()
    .back()
    .assertAtBookReadingView()
    .then(function() {
        casper.closeInfoWindow();
    })
    .waitForInfoWindowClose()
    .back()
    .waitForInfoWindow()
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/2\/423025/, 'Reading route with place correct');
        t.assertNotVisible('.navigation-view button[data-view-id="place-view"].disabled',
            'Place View button is active');
    })
    .then(function() {
        casper.click('.navigation-view button[data-view-id="place-view"]');
    })
    .assertAtBookPlaceView()
    .then(function() {
        t.assertEval(function() { 
            return gv.app.currentView.slots['.right-panel'].slots['.top-slot'].markers[0].map.getZoom() > 0
        },
            "Map isn't screwed up");
    });

casper.run(function() {
    t.done();
});