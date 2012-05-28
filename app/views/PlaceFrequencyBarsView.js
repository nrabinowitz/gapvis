/*
 * Place Frequency Bar Chart View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        PlaceFrequencyBarsView;
    
    // View: BookTitleView (title and metadata)
    PlaceFrequencyBarsView =  BookView.extend({
        className: 'freq-bars-view panel padded-scroll fill loading',
        template: '#bars-header-template',
        
        settings: {
            buckets: 50,
            color: 'steelblue',
            hicolor: 'orange'
        },
        
        initialize: function(opts) {
            var view = this;
            _.extend(view.settings, view.options);
            // listen for state changes
            view.bindState('change:barsort', function() {
                // XXX: is this the right place for this logic?
                var places = view.model.places,
                    sort = state.get('barsort');
                places.comparator = function(place) {
                    return sort == 'ref' ? 
                        -place.get('frequency') :
                        place.get('title')
                };
                places.sort();
                view.render();
            });
        },
        
        render: function() {
            var view = this,
                singlePlace = !!view.options.place,
                book = view.model,
                places = singlePlace ? [view.options.place] : book.places.models,
                settings = view.settings,
                buckets = settings.buckets,
                color = settings.color,
                hicolor = settings.hicolor,
                frequency = function(d) { return d.get('frequency') },
                max = d3.max(places, frequency),
                bh = 12,
                w = 250,
                lw = singlePlace ? 0 : 100,
                spacing = 3,
                x = d3.scale.linear()
                    .domain([0, max])
                    .range([0, w]),
                y = function(d, i) { return i * (bh + spacing) },
                bw = function(d) { return x(frequency(d)) };
                
            // remove loading spinner
            view.$el
                .empty()
                .removeClass('loading');
                
            // make div container (for padding)
            var $container = $('<div></div>').appendTo(view.el);
            
            // title if we're showing the whole book
            if (!singlePlace) {
                $container.append(view.template);
                view.renderControls();
            }
        
            // create svg container
            var svg = d3.select($container[0])
              .append('svg:svg')
                .attr('height', (bh + spacing) * places.length + (singlePlace ? 0 : 10))
                // delegated handler: click
                .on('click', function() {
                    var target = d3.event.target,
                        data = target.__data__,
                        pdata = target.parentNode.__data__;
                    // bar click
                    if ($(target).is('rect')) {
                        var pageId = pages.at(~~((pages.length * data.idx)/buckets)).id;
                        state.set({
                            // scrolljump: true,
                            placeid: pdata.id,
                            pageid: pageId,
                            view: 'reading-view'
                        });
                    }
                    // label click
                    if ($(target).is('text.title')) {
                        state.set({
                            placeid: pdata.id,
                            view: 'place-view'
                        });
                    }
                })
                // delegated handler: mouseover
                .on('mouseover', function() {
                    var $target = $(d3.event.target);
                    if ($target.is('rect')) {
                        d3.select(d3.event.target)
                            .style('fill', hicolor)
                    }
                })
                // delegated handler: mouseout
                .on('mouseout', function() {
                    var $target = $(d3.event.target);
                    if ($target.is('rect') && !$target.is('.selected')) {
                        d3.select(d3.event.target)
                            .style('fill', color)
                    }
                });
            
            var pages = book.pages,
                sidx = d3.scale.quantize()
                    .domain([0, pages.length])
                    .range(d3.range(0, buckets)),
                sx = d3.scale.linear()
                    .domain([0, buckets])
                    .range([0, w]);
                    
            // create and cache spark data
            places.forEach(function(place) {
                if (!place.get('sparkData')) {
                    // make the sparkline data
                    var sdata = d3.range(0, buckets)
                        .map(function(d,i) {
                            return {
                                count: 0,
                                idx: i
                            }
                        });
                    pages.each(function(p, pi) {
                        var pplaces = p.get('places'),
                            pidx = sidx(pi);
                        if (pplaces && pplaces.indexOf(place.id) >= 0) {
                            sdata[pidx].count++;
                        }
                    });
                    place.set({ sparkData: sdata });
                }
            });
                
            var sparkMax = d3.max(places, function(d) { 
                    return d3.max(d.get('sparkData'), function(sd) { return sd.count }) 
                }),
                sy = d3.scale.linear()
                    .domain([0, sparkMax])
                    .range([0, bh]);
            
            // sparkline container
            var spark = svg.selectAll('g.spark')
                .data(places)
              .enter().append('svg:g')
                .attr('class', 'spark')
                .attr("transform", function(d, i) { return "translate(0," + y(d,i) + ")"; });
            
            // baseline
            spark.append('svg:line')
                .attr('x1', lw)
                .attr('x2', lw + w)
                .attr('y1', bh)
                .attr('y2', bh)
                .style('stroke', '#999')
                .style('stroke-width', .5);
                
            // bars
            spark.selectAll('rect')
                .data(function(d) { return d.get('sparkData') })
              .enter().append('svg:rect')
                .each(function(d, i) {
                    if (d.count) {
                        var height = Math.max(2, sy(d.count))
                        d3.select(this)
                            .attr('y', bh - height)
                            .attr('x', sx(i) + lw)
                            .attr('width', w/buckets)
                            .attr('height', height)
                            .style('fill', color)
                            .style('cursor', 'pointer');
                    }
                });
            
            // leave out labels for single place
            if (!singlePlace) {
                // place title
                spark.append('svg:text')
                    .attr('class', 'title')
                    .style('fill', 'black')
                    .attr('x', lw - 8)
                    .attr('y', 0)
                    .attr("dx", 3)
                    .attr("dy", "1em")
                    .text(function(d) { return d.get('title') });
                
                // frequency label
                svg.selectAll('text.freq')
                    .data(places)
                  .enter().append('svg:text')
                    .attr('class', 'freq')
                    .style('fill', 'black')
                    .style('font-size', '10px')
                    .attr('x', lw + w)
                    .attr('y', y)
                    .attr("dx", 3)
                    .attr("dy", ".9em")
                    .text(frequency);
            }
              
            return this;
        },
        
        renderControls: function() {
            var view = this,
                barSort = state.get('barsort');
            console.log(view.$('.ref'), barSort != 'ref');
            console.log(view.$('.alpha'), barSort != 'alpha');
            // render
            view.$('.ref').toggleClass('on', barSort != 'ref');
            view.$('.alpha').toggleClass('on', barSort != 'alpha');
        },
        
        // highlight the current page
        updateHighlight: function() {
            var pages = this.model.pages,
                settings = this.settings,
                pageId = state.get('pageid'),
                sidx = d3.scale.quantize()
                    .domain([0, pages.length])
                    .range(d3.range(0, settings.buckets));
                    
            // clear existing highlights
            d3.select(this.el)
              .selectAll('rect')
                .attr('class', '')
                .style('fill', settings.color);
                
            // let's assume we're in single-page view 
            if (pageId) {
                var i = pages.indexOf(pages.get(pageId));
                d3.select($('rect:eq(' + (sidx(i)+1) + ')', this.el)[0])
                    .attr('class', 'selected')
                    .style('fill', settings.hicolor);
            }
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .ref.on':       'uiSort',
            'click .alpha.on':     'uiSort'
        },
        
        uiSort: function(e) {
            state.set({ barsort: $(e.target).is('.ref') ? 'ref' : 'alpha' })
        }
        
    });
    
    // no d3 option
    if (window.nod3) {
        PlaceFrequencyBarsView = PlaceFrequencyBarsView.extend({
            render: $.noop,
            updateHighlight: $.noop
        });
    }
    
    return PlaceFrequencyBarsView;
    
});