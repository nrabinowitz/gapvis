var t = casper.test,
    baseUrl = "http://localhost:8080/",
    viewUrl = baseUrl + '#book/2/place/423025';

casper.start();
    
casper
    .describe('Place View page')
    .thenOpen(viewUrl)
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book title shown");
        t.assertPermalink(RegExp(baseUrl + '#book/2/place/423025\\?'),
            "Permalink is correct");
        t.assertVisible('div.navigation-view button[data-view-id="place-view"].active',
            'Place Detail button is active');
    });

casper
    .describe('Place View page > Summary')
    .thenOpen(viewUrl)
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText('.place-summary-view h3', 'Roma',
            "Place title shown in summary");
        t.assertExists('.place-summary-view svg rect',
            "Frequency bars shown in summary");
        t.assertEvalEquals(function() {
                return $('.place-summary-view li a').first().attr('href');
            }, 'http://pleiades.stoa.org/places/423025',
            'Pleiades URI correct');
    });
    

casper
    .describe('Place View page > Map')
    .thenOpen(viewUrl)
    .assertAtBookPlaceView()
    .then(function() {
        t.assertEval(function() {
                return gv.app.currentView
                    .slots['.right-panel']
                    .slots['.top-slot']
                    .markers.length == 9; 
            },
            "Some markers are loaded on the map");
        // this is really ugly
        this.evaluate(function() {
            var marker = gv.app.currentView
                    .slots['.right-panel']
                    .slots['.top-slot']
                    .markers[3];
            google.maps.event.trigger(marker, 'click');
        });
    })
    .waitForSelectorToLeave('.place-summary-view h3:contains(Roma)')
    .then(function() {
        t.assertRoute('book/2/place/1027',
            "Route is correct");
        t.assertPermalink(RegExp(baseUrl + '#book/2/place/1027\\?'),
            "Permalink is correct");
        t.assertText('.place-summary-view h3', 'Hispania',
            "Place title shown in summary");
    });
    
casper
    .describe('Place View page > Related Places')
    .thenOpen(viewUrl)
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText('.related-places-view p:nth-child(4)', 'Hispania (6)',
            "Related places shown");
    })
    .then(function() {
        this.click('.related-places-view p:nth-child(4) span');
    })
    .waitForSelectorToLeave('.place-summary-view h3:contains(Roma)')
    .then(function() {
        t.assertRoute('book/2/place/1027',
            "Route is correct");
        t.assertPermalink(RegExp(baseUrl + '#book/2/place/1027\\?'),
            "Permalink is correct");
        t.assertText('.place-summary-view h3', 'Hispania',
            "Place title shown in summary");
        t.assertText('.related-places-view p:nth-child(2)', 'Zella (8)',
            "Related places have been re-rendered");
    });
    
casper
    .describe('Place View page > Book references')
    .thenOpen(baseUrl + '#book/3/place/1052')
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText("h2.book-title", 'The History of the Peloponnesian War',
            "Book title shown");
        t.assertText('.book-refs-view p span.book-title', 'The Works of Cornelius Tacitus: The History',
            "Book reference was found");
    })
    .then(function() {
        casper.click('.book-refs-view p span.book-title');
    })
    .waitForSelectorToLeave('h2.book-title h3:contains(Peloponnesian)')
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book title shown");
        t.assertRoute('book/2/place/1052',
            'Book place route correct');
        t.assertPermalink(RegExp(baseUrl + '#book/2/place/1052\\?'),
            "Permalink is correct");
        t.assertText('.book-refs-view p span.book-title', 'The History of the Peloponnesian War',
            "Book reference was found");
    })
    .then(function() {
        casper.click('.book-refs-view p span.book-title');
    })
    .waitForSelectorToLeave('h2.book-title h3:contains(Tacitus)')
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText("h2.book-title", 'The History of the Peloponnesian War',
            "Book title shown");
        t.assertRoute('book/3/place/1052',
            'Book place route correct');
        t.assertPermalink(RegExp(baseUrl + '#book/3/place/1052\\?'),
            "Permalink is correct");
        t.assertText('.book-refs-view p span.book-title', 'The Works of Cornelius Tacitus: The History',
            "Book reference was found");
    });
    
casper
    .describe('Place View page > Book references (none found)')
    .thenOpen(viewUrl)
    .assertAtBookPlaceView()
    .then(function() {
        t.assertText('.book-refs-view p', 'No other book references were found.',
            "Book references were not found");
    });
    
    
casper.run(function() {
    t.done();
});