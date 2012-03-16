/*
 * Change This Form View
 */
(function(gv, window) {
    var View = gv.View,
        state = gv.state;
    
    // View: ChangeFormView (change this form)
    gv.ChangeFormView = View.extend({
        el: '#change-this-form',
        
        initialize: function() {
            var view = this,
                showSuccess = function() {
                    state.set({ message: "Your feedback was submitted. Thanks!" });
                },
                showError = function() {
                    state.set({ message: "Something went wrong, and we couldn't submit your feedback. Sorry!" });
                };
            // init the dialog, but don't open
            $(view.el).dialog({
                autoOpen: false,
                modal: true,
                buttons: {
                    Submit: function() {
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
                        // close out
                        view.close();
                    },
                    Cancel: function() {
                        view.close();
                    }
                }
            });
        },
        
        open: function() {
            var placeId = state.get('changelinkid'),
                pageId = state.get('pageid'),
                placeName = this.model.places.get(placeId).get('title');
            // set form value and span to match state
            this.$('input[name="place-id"]')
                .val(placeId);
            this.$('#ctf-place-name')
                .html(placeName);
            // set page if appropriate
            if (!this.options.placeOnly) {
                this.$('input[name="page-id"]')
                    .val(pageId);
                this.$('#ctf-page-id')
                    .html(pageId);
            }
            this.$('span.pagenum').toggle(!this.options.placeOnly);
            // open window
            $(this.el).dialog('open');
        },
        
        close: function() {
            $(this.el).dialog('close');
            this.$('form').get(0).reset();
        }
     
    });
    
}(gv, this));