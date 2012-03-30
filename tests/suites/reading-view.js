var t = casper.test,
    baseUrl = "http://localhost:8080/",
    viewUrl = baseUrl + '#book/2/read/-2';

casper.start();
    
casper
    .describe('Reading View page')
    .thenOpen(viewUrl, function() {
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
        t.assertPermalink(RegExp(baseUrl + '#book/2/read/-2\\?'),
            "Permalink is correct");
    });
    
casper
    .describe('Reading View page > Next/Prev')
    .thenOpen(viewUrl, function() {
        t.assertRoute(/^book\/\d+\/read\/-2/, 'Book reading route correct');
        t.assertInText('#page-view div.text:visible', 'Page Negative Two Text.',
            'Page -2 text is shown');
        t.assertDoesNotExist('#prev.on',
            'Previous link is disabled');
        t.assertExists('#next.on',
            'Next link is enabled');
    })
    .then(function() {
        this.click('#next.on');
    })
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/1/, 'Book reading route correct');
        t.assertInText('#page-view div.text:visible', 'Page One Text.',
            'Page 1 text is shown');
        t.assertExists('#prev.on',
            'Previous link is enabled');
        t.assertExists('#next.on',
            'Next link is enabled');
    })
    .then(function() {
        this.click('#next.on');
    })
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/2/, 'Book reading route correct');
        t.assertInText('#page-view div.text:visible', 'Page Two Text.',
            'Page 2 text is shown');
        t.assertExists('#prev.on',
            'Previous link is enabled');
        t.assertExists('#next.on',
            'Next link is enabled');
    })
    .then(function() {
        this.click('#prev.on');
    })
    .wait(300)
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/1/, 'Book reading route correct');
        t.assertInText('#page-view div.text:visible', 'Page One Text.',
            'Page 1 text is shown');
        t.assertExists('#prev.on',
            'Previous link is enabled');
        t.assertExists('#next.on',
            'Next link is enabled');
    })
    .then(function() {
        this.click('#prev.on');
    })
    .wait(300)
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/-2/, 'Book reading route correct');
        t.assertInText('#page-view div.text:visible', 'Page Negative Two Text.',
            'Page -2 text is shown');
        t.assertDoesNotExist('#prev.on',
            'Previous link is disabled');
        t.assertExists('#next.on',
            'Next link is enabled');
    });
    
casper
    .describe('Reading View page > Page View Controls')
    .thenOpen(viewUrl, function() {
        t.assertPermalink(/pageview=text/,
            "Page view setting correct in permalink");
        t.assertVisible('#page-view div.text', 
            'Page text is visible');
        t.assertNotVisible('#page-view div.img', 
            'Page image is not visible');
        t.assertDoesNotExist('#showtext.on',
            'Show Text link is disabled');
        t.assertExists('#showimg.on',
            'Show Image link is enabled');
    })
    .then(function() {
        this.click('#showimg.on');
    })
    .then(function() {
        t.assertPermalink(/pageview=image/,
            "Page view setting correct in permalink");
        t.assertNotVisible('#page-view div.text', 
            'Page text is not visible');
        t.assertVisible('#page-view div.img', 
            'Page image is visible');
        t.assertExists('#showtext.on',
            'Show Text link is enabled');
        t.assertDoesNotExist('#showimg.on',
            'Show Image link is disabled');
    });

casper.run(function() {
    t.done();
});