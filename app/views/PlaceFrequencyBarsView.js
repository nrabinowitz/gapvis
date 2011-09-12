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
                spacing = 2,
                color = 'steelblue';
                
            var data = this.model.places.models,
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
              
            svg.selectAll('rect')
                .data(data)
              .enter().append('svg:rect')
                .attr('x', lw)
                .attr('y', y)
                .attr('height', bh)
                .attr('width', bw)
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
                .attr('x', function(d) { return bw(d) + lw })
                .attr('y', y)
                .attr("dx", 3)
                .attr("dy", ".9em")
                .text(frequency);
                
              
            return this;
        },
        
    });
    
}(gv));