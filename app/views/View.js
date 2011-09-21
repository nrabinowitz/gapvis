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
        _stateHandlers: [],
        bindState: function(event, handler, context) {
            state.bind(event, handler, context);
            this._stateHandlers.push({ event: event, handler: handler });
        },
        unbindState: function() {
            this._stateHandlers.forEach(function(h) {
                state.unbind(h.event, h.handler);
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
                $(view.el).undelegate(selector, eventName);
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
        bindResize: function() {
            var view = this,
                resizeTimerId;
            view._resizeHandler = function() {
                if (!resizeTimerId) {
                    resizeTimerId = window.setTimeout(function() {
                        resizeTimerId = null;
                        view.layout();
                    }, 200);
                }
            };
            $(window).resize(view._resizeHandler);
        },
        unbindResize: function() {
            if (view._resizeHandler) {
                $(window).unbind('resize', view._resizeHandler);
            }
        },
        // override in subclasses
        layout: $.noop,
        // common pattern support
        bindingLayout: function() {
            this.layout();
            this.bindResize();
        }
    });
    
}(gv, this));