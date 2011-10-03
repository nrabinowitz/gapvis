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
            var view = this;
            // init the dialog, but don't open
            $(view.el).dialog({
                autoOpen: false,
                modal: true,
                buttons: {
                    Submit: function() {
                        // post to the server
                        $.post(
                            gv.settings.API_ROOT + '/report_issue',
                            view.$('form').serializeArray()
                            // XXX: no success for now?
                        );
                        // hide form and buttons
                        var formEls = view.$('form')
                            .add($(view.el).siblings('.ui-dialog-buttonpane'));
                        formEls.hide();
                        // display a message
                        var $msg = $('<div class="msg">Problem submitted - thanks!</div>')
                            .appendTo(view.el);
                        // and close out in a second or two
                        setTimeout(function() {
                            view.close();
                            $msg.remove();
                            formEls.show();
                            view.$('form')
                                .get(0).reset();
                        }, 2000);
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
        }
     
    });
    
}(gv, this));