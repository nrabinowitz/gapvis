/*
 * Page models
 */
(function(gv) {
    var Model = gv.Model,
        Collection = gv.Collection,
        API_ROOT = gv.API_ROOT,
        Page;
       
    // Model: Page
    Page = gv.Page = Model.extend({
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
            return API_ROOT +  '/book/' + this.book.id + '/page';
        }
    });
    
}(gv));