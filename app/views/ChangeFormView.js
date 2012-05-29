/*
 * Change This Form View
 */
define(['gv', 'views/BookView', 'models/Flag'], function(gv, BookView, Flag) {
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
                opts = view.options,
                placeId = opts.placeId,
                token = opts.token,
                pageId = state.get('pageid');
            view.ready(function() {
                var book = view.model,
                    bookName = book.get('title');
                // set text to match state
                view.$('#ctf-book-title')
                    .html(bookName);
                view.$('#ctf-place-name')
                    .html(token);
                // show page if appropriate
                if (!view.options.placeOnly) {
                    view.$('#ctf-page-id')
                        .html(pageId);
                } else view.$('span.pagenum').hide();
                // create model
                view.note = new Flag({
                    bookid: view.model.id,
                    placeid: placeId,
                    pageid: pageId,
                    token: token
                });
                // open window
                view.$el.modal('show');
            });
        },
        
        submit: function() {
            var view = this,
                note = view.note,
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
                },
                options = {
                    success: function(model, resp) {
                        if (resp && resp.success) showSuccess(); 
                        else showError();
                    },
                    error: showError
                };
            // post to the server
            if (DEBUG) options.type = 'GET';
            note.save({ 
                note: view.$('textarea[name="note"]').val() 
            }, options);
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