/*
 * Book collection
 */
define(['gv', 'models/Collection', 'models/Book'], function(gv, Collection, Book) {
    
    // Collection: BookList
    return Collection.extend({
        model: Book,
        url: function() { 
            return gv.settings.API_ROOT +  '/books/.json' 
        },
        comparator: function(book) {
            // try for author last name
            var author = (book.get('author') || '')
                .toLowerCase()
                .split(/[,(]/)[0]
                .split(/\s+/)
                .pop();
            return author + book.get('title').toLowerCase(); 
        }
    });
    
});