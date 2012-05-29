var t = casper.test,
    baseUrl = "http://localhost:8080/",
    viewUrl = baseUrl + '#book/2/read/73';

casper.start();
    
casper
    .describe('Change form open')
    .thenOpen(viewUrl)
    .assertAtBookReadingView()
    .then(function() {
        t.assertText('.page-view span.place', 'Rome',
            'Rome is tokenized on page');
    })
    .then(function() {
        casper.mouseEvent('mouseover', '.page-view span.place');
    })
    .then(function() {
        t.assertVisible("#change-this-link",
            "Change This link is shown");
    })
    .then(function() {
        casper.click('#change-this-link button');
    })
    .waitForSelector('#change-this-form')
    .then(function() {
        t.assertVisible("#change-this-form",
            "Change This window is shown");
        t.assertText('#ctf-place-name', 'Rome',
            "Token is correct");
        t.assertText('#ctf-book-title', 'The Works of Cornelius Tacitus: The History',
            "Book title is correct");
        t.assertVisible('#ctf-page-id',
            "Page number is shown");
        t.assertText('#ctf-page-id', '73',
            "Page number is correct");
    });

casper.run(function() {
    t.done();
});