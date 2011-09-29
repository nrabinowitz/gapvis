/*
 * Place Detail Flickr View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state,
        FLICKR_URL_BASE = 'http://api.flickr.com/services/feeds/photos_public.gne?tags=pleiades%3Aplace%3D[id]&format=json&jsoncallback=?';
    
    // View: BookPlaceFlickrView (Flickr photos for the place detail page)
    gv.BookPlaceFlickrView = View.extend({
        el: '#place-flickr-view',
    
        initialize: function() {
            this.template = _.template($('#flickr-photo-template').html())
        },
        
        clear: function() {
            this.$('span.flickr-link').hide();
            this.$('div.photos').empty();
        },
        
        render: function() {
            var view = this,
                placeId = state.get('placeid');
            // die if no place
            if (!placeId) return;
             
            // get Flickr data for this place
            $.ajax({
                url: FLICKR_URL_BASE.replace('[id]', placeId),
                dataType: 'jsonp',
                success: function(data) {
                    var photos = data && data.items || [];
                    // XXX hide on fail?
                    if (photos.length) {
                        view.$('span.flickr-link a')
                            .attr('href', data.link)
                            .parent().show();
                        photos.slice(0,10).forEach(function(photo) {
                            // get the thumbnail image
                            photo.src = photo.media.m.replace('_m.jpg', '_s.jpg');
                            view.$('div.photos').append(view.template(photo))
                        });
                    }
                }
            });
        }
    });
    
}(gv));