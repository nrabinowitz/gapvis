/*
 * Frequency Legend View
 */
define(['gv'], function(gv) {
    
    // View: Frequency Legend
    return gv.View.extend({
        className: 'frequency-legend-view',
        template: '#frequency-legend-template',
        
        render: function() {
            var view = this;
            // render template
            view.$el.html(view.template);
            // make legend
            gv.settings.colorThemes.forEach(function(theme) {
                var img = theme.eventIcon;
                view.$('.images').append('<img src="' + img + '">');
            });
            return view;
        }
        
    });
    
});