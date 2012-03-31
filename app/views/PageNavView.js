/*
 * Page Nav View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        PageNavView;
    
    // View: PageNavView (little thumbnails)
    PageNavView = View.extend({
        el: '#page-nav-view',
        
        initialize: function() {
            // listen for state changes
            this.bindState('change:pageid', this.renderCurrentPage, this);
            this.bindState('change:placeid', this.renderSelectedPlace, this);
        },
        
        render: function() {
            var book = this.model;
            // we're still loading, come back later
            if (!book.pages.length) {
                book.pages.on('reset', this.render, this);
                return;
            }
            
            var data = book.pages.models,
                h = 40,
                ratio = 3/4,
                spacing = 5,
                pages = data.length,
                w = $('#book-view').width() - 40,
                ph = h - spacing,
                pw = ph * ratio,
                rows = 1, cols;
            while ((pw + spacing) * pages / rows > w) {
                h *= 1.2;
                rows++;
                ph = ((h - spacing * rows) / rows);
                pw = ph * ratio;
            }
            cols = ~~(w / (pw + spacing));
            // make nav
            d3.select(this.el)
                .style('height', h + 'px')
              .selectAll('div')
                .data(data)
              .enter().append('div')
                .style('width', pw + 'px')
                .style('height', ph + 'px');
            
            this.renderCurrentPage();
            this.renderSelectedPlace();
        },
        
        renderCurrentPage: function() {
            var pageId = state.get('pageid');
            d3.select(this.el)
              .selectAll('div')
                .classed('current', function(d) { return d.id == pageId });
        },
        
        renderSelectedPlace: function() {
            var placeId = state.get('placeid');
            d3.select(this.el)
              .selectAll('div')
                .classed('haspoi', function(d) {
                    var places = d.get('places');
                    return places && places.indexOf(placeId) >= 0; 
                });
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click div':    'uiOpenPage'
        },
        
        uiOpenPage: function(e) {
            // this is a little ugly - better to use d3's machinery?
            var pageId = e.target.__data__.id;
            state.set({ pageid: pageId });
        }
    });
    
    // register
    // gv.registerChildView(gv.BookView, PageNavView);
    
}(gv));