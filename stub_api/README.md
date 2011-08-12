API Suggestions
===============

Core API
-----------
 * list of books, with core metadata (see *books.json*):
        /books.json
 * book info, with metadata (see *book_2.json*):
        /book/<book_id>.json
 * book info, with metadata, plus a list of pages with place refs and a list of places appearing here, core data only (see *book_full_2.json*):
        /book/<book_id>/full.json
 * page info, including text - id either number or other id scheme (see *page_1.json* - note the syntax I'm suggesting for marking place references in the HTML text):
        /book/<book_id>/page/<page_id>.json
 * detailed place info, including description, metadata, etc (see *place_1.json* - there might be lots of additional metadata we might add):
        /place/<place_id>.json

Probably Unnecessary API
------------------------
These are probably part of the core book data, so may not need their own URIs.
 * core place info for all places in book, including id, title and geometry:
        /book/<book_id>/places.json
 * all page-place links for a range of pages, including core place info:
        /book/<book_id>/pageplaces.json?start=<page_id>&end=<page_id>

API Questions
-----------------
 * Will the full book info be an excessively large download for large works?
 * Do authors need a model at this point? (I'm guessing they will eventually)
 * Is it worth designing the API for non-point geometries (e.g. polygons, etc), or can we assume that's it for now?