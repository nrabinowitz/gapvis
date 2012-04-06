/*
 * Page models
 */
(function(gv) {
    var Model = gv.Model,
        Collection = gv.Collection,
        settings = gv.settings,
        Page;
       
    // Model: Page
    Page = gv.Page = Model.extend({
        type: 'page',
        
        defaults: {
            places: []
        }, 
        
        initialize: function() {
            this.set({
                title:'Page ' + this.id
            });
        },
        
        isFullyLoaded: function() {
            return !!this.get('text');
        }
    });
    
    // Collection: PageList
    gv.PageList = Collection.extend({
        model: Page,
        url: function() {
            return settings.API_ROOT +  '/books/' + this.book.id + '/page';
        }
    });
    
}(gv));