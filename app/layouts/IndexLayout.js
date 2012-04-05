/*
 * Index Layout
 */
(function(gv) {
        
    // View: IndexLayout (index page)
    gv.IndexLayout = gv.Layout.extend({
        el: '#index-view',
        
        layout: function() {
            $('#book-list-view, #instructions').height(
                this.topViewHeight() - 50
            );
        }
    });
    
}(gv));