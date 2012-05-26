/*
 * Change This Form View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: ChangeFormView (change this form)
    return BookView.extend({
        el: '#change-this-form',
        
        initialize: function() {
            // init the dialog, but don't open
            this.$el.modal({
                show: false
            });
        },
        
        clear: function() {
            this.close();
            this.undelegateEvents();
        },
        
        open: function() {
            var view = this,
                placeId = state.get('changelinkid'),
                pageId = state.get('pageid');
            view.ready(function() {
                var book = view.model,
                    bookName = book.get('title'),
                    placeName = '"' + book.places.get(placeId).get('title') + '"';
                // set form value and span to match state
                view.$('input[name="book-id"]')
                    .val(placeId);
                view.$('#ctf-book-title')
                    .html(bookName);
                view.$('input[name="place-id"]')
                    .val(placeId);
                view.$('#ctf-place-name')
                    .html(placeName);
                // set page if appropriate
                if (!view.options.placeOnly) {
                    view.$('input[name="page-id"]')
                        .val(pageId);
                    view.$('#ctf-page-id')
                        .html(pageId);
                }
                view.$('span.pagenum').toggle(!view.options.placeOnly);
                // open window
                view.$el.modal('show');
            });
        },
        
        submit: function() {
            var view = this,
                showSuccess = function() {
                    state.set({
                        message: { 
                            text: "Your feedback was submitted. Thanks!",
                            type: "success"
                        }
                    });
                },
                showError = function() {
                    state.set({ 
                        message: { 
                            text: "Something went wrong, and we couldn't submit your feedback. Sorry!",
                            type: "error"
                        }
                    });
                };
            // post to the server
            $.ajax({
                type: 'POST',
                url: gv.settings.REPORT_URL,
                data: view.$('form').serializeArray(),
                success: function(data) {
                    if (data && data.success) showSuccess(); 
                    else showError();
                },
                error: showError,
                dataType: 'json'
            });
            state.set({ message: "Submitting..." });
            // close out
            view.close();
        },
        
        close: function() {
            this.$el.modal('hide');
            this.$('form').get(0).reset();
        },
        
        // UI Event Handlers
        
        events: {
            'click .cancel':    'close',
            'click .submit':    'submit'
        }
     
    });
    
});