var t = casper.test,
    baseUrl = "http://localhost:8080/",
    viewUrl = baseUrl + '#book/2/place/423025';

casper.start();
    
casper
    .describe('Place View page')
    .thenOpen(viewUrl, function() {
        t.assertAtBookPlaceView();
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book title shown");
        t.assertPermalink(RegExp(baseUrl + '#book/2/place/423025\\?'),
            "Permalink is correct");
        t.assertExists('#book-place-view div.navigation-view label[for^="nav-place"].ui-state-active',
            'Place Detail button is active');
    });

casper
    .describe('Place View page > Summary')
    .thenOpen(viewUrl, function() {
        t.assertText('#place-summary-view h3', 'Roma',
            "Place title shown in summary");
        t.assertExists('#place-summary-view svg rect',
            "Frequency bars shown in summary");
        t.assertEvalEquals(function() {
                return $('#place-summary-view li a').first().attr('href');
            }, 'http://pleiades.stoa.org/places/423025',
            'Pleiades URI correct');
    });
    

casper
    .describe('Place View page > Map')
    .thenOpen(viewUrl, function() {
        t.assertEval(function() { return gv.app.currentView.children[4].markers.length == 9; },
            "Some markers are loaded on the map");
        // this is really ugly
        this.evaluate(function() {
            var marker = gv.app.currentView.children[4].markers[3];
            google.maps.event.trigger(marker, 'click');
        });
    })
    .then(function() {
        t.assertRoute('book/2/place/1027',
            "Route is correct");
        t.assertPermalink(RegExp(baseUrl + '#book/2/place/1027\\?'),
            "Permalink is correct");
        t.assertText('#place-summary-view h3', 'Hispania',
            "Place title shown in summary");
    });;
    
casper
    .describe('Place View page > Related Places')
    .thenOpen(viewUrl, function() {
        t.assertText('#related-places-view p:nth-child(4)', 'Hispania (6)',
            "Related places shown");
    })
    .then(function() {
        this.click('#related-places-view p:nth-child(4) span')
    })
    .then(function() {
        t.assertRoute('book/2/place/1027',
            "Route is correct");
        t.assertPermalink(RegExp(baseUrl + '#book/2/place/1027\\?'),
            "Permalink is correct");
        t.assertText('#place-summary-view h3', 'Hispania',
            "Place title shown in summary");
        t.assertText('#related-places-view p:nth-child(2)', 'Zella (8)',
            "Related places have been re-rendered");
    });
    
casper.run(function() {
    t.done();
});