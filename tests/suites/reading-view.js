var t = casper.test,
    baseUrl = "http://localhost:8080/",
    viewUrl = baseUrl + '#book/2/read/-2';

casper.start();
    
// Testing book reading page
casper
    .thenOpen(viewUrl, function() {
        t.comment('Testing book reading page');
        t.assertAtBookReadingView();
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book title shown");
        t.assertEval(function() {
            window.tm = gv.app.currentView.children[3].tm;
            return !!window.tm;
        }, "TimeMap object found");
        t.assertEval(function() {
            return window.tm.getItems().length > 0;
        }, "Some items are loaded on the timemap");
        var permalink = this.evaluate(function() { return $('a.permalink').attr('href') });
        t.assertMatch(permalink, RegExp(baseUrl + '#book/2/read/-2\\?'), 
            "Permalink is correct");
        // test page
        t.assertVisible('#page-view div.text', 
            'Page text is visible');
        t.assertNotVisible('#page-view div.img', 
            'Page image is not visible');
        t.assertEval(function() { return $('#page-view div.text').text().trim().length > 0 },
            'Some page text is shown');
        t.assertDoesNotExist('#prev.on',
            'Previous link is disabled');
        t.assertExists('#next.on',
            'Previous link is enabled');
    });

casper.run(function() {
    t.done();
});