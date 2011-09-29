API Suggestions
===============

Core API
-----------
 * list of available books, with core metadata:
        /books.json
 * book info, with metadata and a list of pages with place refs and a list of places appearing here, core data only:
        /book/<book_id>/full.json (I've been thinking about renaming this to /book/<book_id>.json, which is probably more consistent - I originally thought that would be a stripped-down book info API, but I don't see the point now)
 * page info, including text - id either number or other id scheme (note the syntax I'm suggesting for marking place references in the HTML text):
        /book/<book_id>/page/<page_id>.json
 * detailed place info, including geometry, description, metadata, etc (there might be additional metadata we might add):
        /place/<place_id>.json