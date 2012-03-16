/*
 * Core setup for views
 */
(function(gv, window) {
    var state = gv.state;

    // default view
    gv.View = Backbone.View.extend({
        // basic open/close support
        open: function() {
            $(this.el).show();
        },
        close: function() {
            $(this.el).hide();
        },
        // bind/unbind state listeners
        bindState: function(event, handler, context) {
            // create handler array if necessary
            if (!this._stateHandlers) {
                this._stateHandlers = [];
            }
            state.on(event, handler, context);
            this._stateHandlers.push({ event: event, handler: handler });
        },
        unbindState: function() {
            (this._stateHandlers || []).forEach(function(h) {
                state.off(h.event, h.handler);
            });
        },
        // unbind UI event handlers
        unbindEvents: function() {
            var view = this,
                eventSplitter = /^(\S+)\s*(.*)$/,
                events = view.events || [];
            _(events).each(function(e, key) {
                var match = key.match(eventSplitter),
                    eventName = match[1], 
                    selector = match[2];
                view.$el.undelegate(selector, eventName);
            });
        },
        // basic clear support
        clear: function() {
            $(this.el).empty();
            this.unbindState();
            this.unbindEvents();
            this.unbindResize();
        },
        // bind layout() to window resize, with timeout
        bindResize: function(f) {
            // create handler array if necessary
            if (!this._resizeHandlers) {
                this._resizeHandlers = [];
            }
            var view = this,
                callback = f || function() { view.layout() },
                resizeTimerId,
                handler = function() {
                    /* 
                    if (!resizeTimerId) {
                        resizeTimerId = window.setTimeout(function() {
                            resizeTimerId = null;
                            callback();
                        }, 200);
                    } */
                    callback();
                };
            view._resizeHandlers.push(handler);
            $(window).resize(handler);
        },
        unbindResize: function() {
            (this._resizeHandlers || []).forEach(function(h) {
                $(window).off('resize', h);
            });
        },
        // override in subclasses
        layout: $.noop,
        // common pattern support
        bindingLayout: function() {
            this.layout();
            this.bindResize();
        },
        // top view size
        topViewHeight: function() {
            return $(window).height() - 115;
        },
        topViewWidth: function() {
            return $(window).width() - 70;
        }
    });
    
}(gv, this));