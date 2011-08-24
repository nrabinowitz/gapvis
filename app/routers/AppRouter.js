/*
 * App Router
 */
(function(gv) {
    var state = gv.state,
        AppRouter,
        // array to hold registered routers
        routers = [];
    
    AppRouter = gv.AppRouter = gv.Router.extend({
    
        initialize: function() {
            var router = this;
            // instantiate registered routers
            routers.forEach(function(r) {
                r.router = new r.cls();
            });
            // set up history to catch querystrings
            Backbone.history.getFragment = function() {
                var fragment = Backbone.History.prototype.getFragment.apply(this, arguments),
                    // intercept and get querystring
                    parts = fragment.split('?'),
                    qs = parts[1];
                if (qs) {
                    router.parseQS(qs);
                }
                return parts[0];
            };
            // listen for state changes
            state.bind('change:topview', this.updateRoute, this);
        },
        
        // get the router for the current top view
        getRouter: function() {
            var topview = state.get('topview');
            return _(routers).detect(function(r) {
                return r.view == topview;
            }).router;
        },
        
        getRoute: function() {
            // delegate
            return this.getRouter().getRoute();
        },
        
        navigate: function(route, trigger) {
            // delegate
            return this.getRouter().navigate(route, trigger);
        },
        
        
        // Querystring functions
        
        // list of parameters to de/serialize in the querystring
        qsParams: ['mapzoom', 'mapcenter', 'pageview', 'maptypeid'],
        
        // set any global state variables from the querystring
        parseQS: function(qs) {
            qs.split('&').forEach(function(pair) {
                var kv = pair.split('='),
                    val = kv[1] ? decodeURIComponent(kv[1]) : null;
                if (kv.length > 1) {
                    state.setSerialized(kv[0], val);
                }
            });
        },
        
        // encode a querystring from state parameters
        getQS: function() {
            var qs = this.qsParams.map(function(key) {
                    var value = state.get(key),
                        fragment = '';
                    if (value) {
                        fragment = key + '=' + encodeURI(state.serialize(key, value));
                    }
                    return fragment;
                }).filter(_.identity).join('&');
            return qs ? '?' + qs : '';
        },
        
        // the full link, with querystring in state
        getPermalink: function() {
            return window.location.href + this.getQS();
        }

    });
    
    // register a router class to deal with a top-level view
    AppRouter.register = function(router, view) {
        routers.push({
            view: view,
            cls: router
        })
    };
    
}(gv));