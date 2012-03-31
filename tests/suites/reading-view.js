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
    })
    .thenOpen(baseUrl + '#book/2/read/385', function() {
        t.assertInText('#page-view div.text:visible', 'Last Page Text.',
            'Last page text is shown');
        t.assertDoesNotExist('#next.on',
            'Next link is disabled');
        t.assertExists('#prev.on',
            'Previous link is enabled');
    });
    
casper
    .describe('Reading View page > Page Nav Field')
    .thenOpen(viewUrl, function() {
        t.assertEvalEquals(function() { return $('#page-id').val() }, "-2",
            "Nav form is correct");
    })
    .then(function() {
        this.click('#next.on');
    })
    .then(function() {
        t.assertEvalEquals(function() { return $('#page-id').val() }, "1",
            "Nav form updates on next");
    })
    .thenOpen(baseUrl + '#book/2/read/385', function() {
        t.assertEvalEquals(function() { return $('#page-id').val() }, "385",
            "Nav form updates on route change");
    })
    .then(function() {
        this.evaluate(function() { $('#page-id').val('133').change() })
    })
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/133/, 'Book reading route correct');
    })
    .then(function() {
        this.evaluate(function() { $('#page-id').val('spam').change() })
        t.assertEvalEquals(function() { return $('#page-id').val() }, "133",
            "Nav form won't accept an invalid page");
        this.evaluate(function() { $('#page-id').val('200').change() })
        t.assertEvalEquals(function() { return $('#page-id').val() }, "133",
            "Nav form won't accept an invalid page");
        this.evaluate(function() { $('#page-id').val('').change() })
        t.assertEvalEquals(function() { return $('#page-id').val() }, "133",
            "Nav form won't accept an invalid page");
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
        t.assertText('#page-view div.img:visible', '(No image available)',
            'No image available message shown');
    })
    .then(function() {
        this.click('#next.on');
    })
    .then(function() {
        t.assertVisible('#page-view div.img img', 
            'Page image is visible (actual file)');
    });
    
casper
    .describe('Reading View page > Places in Page Text')
    .thenOpen(baseUrl + '#book/2/read/2')
    .then(function() {
        t.assertVisible('#page-view div.text span.place[data-place-id="423025"]',
            'Roma is shown in the page text');
        this.click('#page-view div.text span.place[data-place-id="423025"]');
    })
    .waitUntilVisible('div.infowindow')
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/2\/423025/, 'Reading route with place correct');
        t.assertInfoWindow('Roma', 'Roma is selected in info window after click');
        t.assertVisible('#page-view div.text span.place.hi[data-place-id="423025"]',
            'Roma is highlighted in the page text');
    });
    
casper
    .describe('Reading View page > Places in Page Text (Selected Place)')
    .thenOpen(baseUrl + '#book/2/read/2/423025')
    .waitUntilVisible('div.infowindow')
    .waitUntilVisible('div.infowindow')
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/2\/423025/, 'Reading route with place correct');
        t.assertInfoWindow('Roma', 'Roma is selected in info window after click');
        t.assertVisible('#page-view div.text span.place.hi[data-place-id="423025"]',
            'Roma is highlighted in the page text');
    });
    
casper
    .describe('Reading View page > Timemap')
    .thenOpen(viewUrl, function() {
        t.assertEval(function() {
            window.tm = gv.app.currentView.children[3].tm;
            return !!window.tm;
        }, "TimeMap object found");
        t.assertEval(function() {
            return window.tm.getItems().length > 0;
        }, "Some items are loaded on the timemap");
        t.assertVisible('div.timeline-date-label:contains("-2")',
            "The first date label is visible");
        t.assertVisible('#label-tl-0-0-e9',
            "The ninth event is visible");
        t.assertText('#label-tl-0-0-e9', 'Roma',
            "Ninth event label is correct");
        t.assertNotVisible('div.infowindow',
            "The info window is closed");
    })
    .then(function() {
        this.mouseEvent('mousedown', '#label-tl-0-0-e9');
    })
    .waitUntilVisible('div.infowindow')
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/2\/423025/, 'Route with place correct');
        t.assertInfoWindow('Roma', 'Roma is selected in info window after click');
        t.assertExists('div.infowindow svg rect',
            "Frequency bars shown in info window");
        t.assertExists('div.infowindow svg rect.selected:nth-child(3)',
            "Correct frequency bar is selected");
        t.assertDoesNotExist('div.infowindow span.prev.on',
            'Infowindow previous link is disabled');
        t.assertExists('div.infowindow span.next.on',
            'Infowindow next link is disabled');
        t.assertVisible('#page-view div.text span.place.hi[data-place-id="423025"]',
            'Roma is highlighted in the page text');
    })
    .then(function() {
        this.click('div.infowindow span.next.on');
    })
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/5\/423025/, 'Route with place and next page correct');
        t.assertInfoWindow('Roma', 'Roma is still selected in info window');
        t.assertExists('div.infowindow span.prev.on',
            'Infowindow previous link is enabled');
        t.assertExists('div.infowindow span.next.on',
            'Infowindow next link is disabled');
        t.assertVisible('#page-view div.text span.place.hi[data-place-id="423025"]',
            'Roma is highlighted in the page text');
    })
    .then(function() {
        this.click('div.infowindow span.next.on');
    })
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/8\/423025/, 'Route with place and next page correct');
        t.assertInfoWindow('Roma', 'Roma is still selected in info window');
        t.assertVisible('#page-view div.text span.place.hi[data-place-id="423025"]',
            'Roma is highlighted in the page text');
        t.assertExists('div.infowindow svg rect.selected:nth-child(4)',
            "Correct frequency bar is selected");
    })
    .then(function() {
        this.click('div.infowindow span.prev.on');
    })
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/5\/423025/, 'Route with place and next page correct');
        t.assertInfoWindow('Roma', 'Roma is still selected in info window');
    })
    .then(function() {
        this.click('div.infowindow svg rect:nth-child(5)');
    })
    .then(function() {
        t.assertRoute(/^book\/\d+\/read\/23\/423025/, 'Route with place and next page correct');
        t.assertInfoWindow('Roma', 'Roma is still selected in info window');
    });
    
casper
    .describe('Reading View page > Selected Place')
    .thenOpen(baseUrl + '#book/2/read/2/423025')
    .waitUntilVisible('div.infowindow')
    .then(function() {
        t.assertInfoWindow('Roma', 'Roma is selected in info window');
        t.assertDoesNotExist('#book-view div.navigation-view label[for^="nav-place"].ui-state-disabled',
            'Place Details button is active');
    })
    .then(function() {
        this.click('div.infowindow span.goto-place');
    })
    .then(function() {
        t.assertRoute(/^book\/2\/place\/423025/, 'Place details route correct');
        t.assertInfoWindow('Roma', 'Roma is still selected in info window');
    })
    .back()
    .then(function() {
        this.click('#book-view div.navigation-view label[for^="nav-place"]');
    })
    .then(function() {
        t.assertRoute(/^book\/2\/place\/423025/, 'Place details route correct');
        t.assertInfoWindow('Roma', 'Roma is still selected in info window');
    });
    
casper
    .describe('Reading View page > Info Window closing back/forward')
    .thenOpen(baseUrl + '#book/2/read/2/423025')
    .waitUntilVisible('div.infowindow')
    .then(function() {
        t.assertInfoWindow('Roma', 'Roma is selected in info window');
        t.assertDoesNotExist('#book-view div.navigation-view label[for^="nav-place"].ui-state-disabled',
            'Place Details button is active');
    })
    .then(function() {
        this.closeInfoWindow();
    })
    .then(function() {
        t.assertRoute(/^book\/2\/read\/2$/, 'Reading route correct, no place');
        t.assertDoesNotExist('div.infowindow',
            'Info window is closed');
        t.assertExists('#book-view div.navigation-view label[for^="nav-place"].ui-state-disabled',
            'Place Details button is disabled');
    })
    .back()
    .waitUntilVisible('div.infowindow', function() {
        t.pass('Info window re-opens on back');
    }, function() {
        t.fail('Info window re-opens on back');
    })
    .then(function() {
        t.assertInfoWindow('Roma', 'Roma is selected in info window');
        t.assertDoesNotExist('#book-view div.navigation-view label[for^="nav-place"].ui-state-disabled',
            'Place Details button is active');
    })
    .forward()
    .then(function() {
        t.assertRoute(/^book\/2\/read\/2$/, 'Reading route correct, no place');
        t.assertDoesNotExist('div.infowindow',
            'Info window is closed');
        t.assertExists('#book-view div.navigation-view label[for^="nav-place"].ui-state-disabled',
            'Place Details button is disabled');
    });
    

casper
    .describe('Reading View page > Info Window closing - place page interaction')
    .thenOpen(baseUrl + '#book/2/read/2/423025')
    .waitUntilVisible('div.infowindow')
    .then(function() {
        this.click('div.infowindow span.goto-place');
    })
    .then(function() {
        t.assertAtBookPlaceView();
    })
    .back()
    .then(function() {
        t.assertAtBookReadingView();
    })
    .then(function() {
        this.closeInfoWindow();
    })
    .back()
    .waitUntilVisible('div.infowindow', function() {
        t.pass('Info window re-opens on back');
    }, function() {
        t.fail('Info window re-opens on back');
    })
    .then(function() {
        t.assertInfoWindow('Roma', 'Roma is selected in info window');
        t.assertDoesNotExist('#book-view div.navigation-view label[for^="nav-place"].ui-state-disabled',
            'Place Details button is active');
    });
    

casper.run(function() {
    t.done();
});