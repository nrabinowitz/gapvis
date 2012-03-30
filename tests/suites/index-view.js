var t = casper.test,
    baseUrl = "http://localhost:8080/";

casper.start();

// Testing index page
casper
    .thenOpen(baseUrl, function() {
        t.comment("Testing index page");
        t.assertAtIndexView();
        t.assertTitle("GapVis: Visual Interface for Reading Ancient Texts", 
            "Loaded application");
        t.assertText("h2", "Overview",
            "Index page title is visible");
        t.assertEvalEquals(function() { return $('div#book-list p').length }, 2,
            "Two books were found");
        t.assertText('div#book-list p span', 'The Works of Cornelius Tacitus: The History',
            "The first book has the right title");
    })
    .then(function() {
        t.comment('Testing book summary page > Links');
    })
    .then(function() {
        this.click('div#book-list p span');
    })
    .then(function() {
        t.assertAtBookSummaryView();
    })
    .back()
    .then(function() {
        t.assertAtIndexView();
    });

casper.run(function() {
    t.done();
});