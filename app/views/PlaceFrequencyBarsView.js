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
                w = 350,
                spacing = 2,
                color = 'steelblue';
                
            var data = this.model.places.models.slice(0,20),
                frequency = function(d) { return d.get('frequency') },
                max = d3.max(data, frequency),
                x = d3.scale.linear()
                    .domain([0, max])
                    .range([0, w]),
                y = function(d, i) { return i * (bh + spacing) },
                bw = function(d) { return x(frequency(d)) };
        
            var svg = d3.select(this.el)
              .append('svg:svg');
              
            svg.selectAll('rect')
                .data(data)
              .enter().append('svg:rect')
                .attr('y', y)
                .attr('height', bh)
                .attr('width', bw)
                .style('fill', color);
                
            svg.selectAll('text.title')
                .data(data)
              .enter().append('svg:text')
                .attr('class', 'title')
                .style('fill', 'white')
                .style('font-size', '10px')
                .attr('y', y)
                .attr("dx", 3)
                .attr("dy", ".9em")
                .text(function(d) { return d.get('title') });
            
            svg.selectAll('text.freq')
                .data(data)
              .enter().append('svg:text')
                .attr('class', 'freq')
                .style('fill', 'black')
                .style('font-size', '10px')
                .attr('x', bw)
                .attr('y', y)
                .attr("dx", 3)
                .attr("dy", ".9em")
                .text(frequency);
                
              
            return this;
        },
        
    });
    
}(gv));