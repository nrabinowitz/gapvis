/*
 * Book Summary Text View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookWordCloudView (word cloud for the book summary)
    gv.BookWordCloudView = View.extend({
        el: '#book-wordcloud-view',
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model;
            $(view.el).append('<h3>Most Frequent Words</h3>');
            book.wordsReady(function() {
                var words = book.get('words').slice();
                    max = words[0][1],
                    min = words[words.length-1][1],
                    emScale = d3.scale.linear()
                        .domain([min, max])
                        .range([.6, 2.4]);
                words.sort(function(a,b) {
                    return d3.ascending(a[0], b[0]);
                });
                // make words
                words.forEach(function(w) {
                    $('<span>' + w[0] + ' </span>')
                        .css('font-size', emScale(w[1]) + 'em')
                        .appendTo(view.el);
                })
            })
        }
        
    });
    
}(gv));