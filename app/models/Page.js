/*
 * Page models
 */
(function(window, gv) {
    var Model = gv.Model,
        Collection = gv.Collection,
        API_ROOT = gv.API_ROOT,
        Page, PageList;
       
    // Model: Page
    gv.Page = Model.extend({
        defaults: {
            places: []
        }, 
        
        initialize: function() {
            this.set({
                title:'Page ' + this.id
            });
        }
    });
    
    // Collection: PageList
    gv.PageList = Collection.extend({
        model: Page,
        url: function() {
            return API_ROOT +  '/book/' + this.book.id + '/page';
        }
    });
    
}(window, gv));