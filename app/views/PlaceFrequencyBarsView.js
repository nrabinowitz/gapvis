/*
 * Place Frequency Bar Chart View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookTitleView (title and metadata)
    gv.PlaceFrequencyBarsView = View.extend({
        el: '#place-freq-bars-view',
        
        render: function() {
            var bh = 12,
                w = 250,
                lw = 100,
                spacing = 3,
                color = 'steelblue';
                
            var book = this.model,
                data = book.places.models,
                pages = book.pages.models,
                buckets = 50,
                frequency = function(d) { return d.get('frequency') },
                max = d3.max(data, frequency),
                x = d3.scale.linear()
                    .domain([0, max])
                    .range([0, w]),
                y = function(d, i) { return i * (bh + spacing) },
                bw = function(d) { return x(frequency(d)) };
        
            var svg = d3.select(this.el)
              .append('svg:svg')
              .style('height', (bh + spacing) * data.length + 10);
            
            /*  
            svg.selectAll('rect')
                .data(data)
              .enter().append('svg:rect')
                .attr('x', lw)
                .attr('y', y)
                .attr('height', bh)
                .attr('width', bw)
                .style('fill', color);
            */
            
            var sidx = d3.scale.quantize()
                    .domain([0, pages.length])
                    .range(d3.range(0, buckets)),
                sx = d3.scale.linear()
                    .domain([0, buckets])
                    .range([0, w]),
                sparkData = data.map(function(d, i) {
                    // make the sparkline data
                    var sdata = d3.range(0, buckets).map(d3.functor(0));
                    pages.forEach(function(p, pi) {
                        var pplaces = p.get('places'),
                            pidx = sidx(pi);
                        if (pplaces && pplaces.indexOf(d.id) >= 0) {
                            sdata[pidx]++;
                        }
                    });
                    return sdata;
                }),
                sparkMax = d3.max(sparkData, function(d) { return d3.max(d) }),
                sy = d3.scale.linear()
                    .domain([0, sparkMax])
                    .range([0, bh]);
            
            var spark = svg.selectAll('g.spark')
                .data(sparkData)
              .enter().append('svg:g')
                .attr('class', 'spark')
                .attr("transform", function(d, i) { return "translate(0," + y(d,i) + ")"; });
            
            spark.append('svg:line')
                .attr('x1', lw)
                .attr('x2', lw + w)
                .attr('y1', bh)
                .attr('y2', bh)
                .style('stroke', '#999')
                .style('stroke-width', .5);
                
            spark.selectAll('rect')
                .data(function(d) { return d })
              .enter().append('svg:rect')
                .attr('y', function(d) { return bh - sy(d) })
                .attr('x', function(d,i) { return sx(i) + lw })
                .attr('width', w/buckets)
                .attr('height', sy)
                .style('fill', color);
                
            svg.selectAll('text.title')
                .data(data)
              .enter().append('svg:text')
                .attr('class', 'title')
                .style('fill', 'black')
                .style('font-size', '10px')
                .attr('x', lw - 8)
                .attr('y', y)
                .attr("dx", 3)
                .attr("dy", ".9em")
                .attr('text-anchor', 'end')
                .text(function(d) { return d.get('title') });
            
            svg.selectAll('text.freq')
                .data(data)
              .enter().append('svg:text')
                .attr('class', 'freq')
                .style('fill', 'black')
                .style('font-size', '10px')
                .attr('x', lw + w)
                .attr('y', y)
                .attr("dx", 3)
                .attr("dy", ".9em")
                .text(frequency);
                
              
            return this;
        },
        
    });
    
}(gv));