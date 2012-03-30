var t = casper.test,
    baseUrl = "http://localhost:8080/",
    summaryUrl = baseUrl + '#book/2';

casper.start();
    
// Testing book reading page
casper
    .thenOpen(baseUrl + '#book/2/read/-2', function() {
        t.comment('Testing book reading page');
        t.assertAtBookReadingView();
        t.assertText("h2.book-title", 'The Works of Cornelius Tacitus: The History',
            "Book title shown");
    });

casper.run(function() {
    t.done();
});