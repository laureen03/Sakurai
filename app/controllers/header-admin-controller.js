/**
 *
 * @type {SakuraiWebapp.HeaderAdminController}
 */
SakuraiWebapp.HeaderAdminController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,{
    admin: Ember.inject.controller(),
    adminController: Ember.computed.alias('admin'),

    /**
     * @property {Ember.A} alias of current instructor products from injected admin controller
     */
    products : Ember.computed.alias("admin.products"),

    activeHeaderMenu: function (section) {
        $(".active").removeClass("active");
        $("." + section).addClass("active");
    },

    loadProducts: function(){
        var controller = this;
        if (!controller.get("products")){ //Check if the products are loaded, and if the products list is empty, load again
            var store = controller.store;
            var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
            var publisher = authenticationManager.getCurrentPublisher();
            var promise = store.query("product", {publisherName: publisher.get("name")});
            promise.then(function(products){
                controller.get("adminController").set("products", products);
            });
        }
    }.on("init"),

    actions: {
        logout: function () {
            var context = SakuraiWebapp.context;
            var authenticationManager = context.get('authenticationManager');
            authenticationManager.reset();
            this.transitionToRoute("index");

            // Karma does not support full page reload in its tests so we avoid
            // reloading the document if we're in the testing environment
            if (!SakuraiWebapp.context.isEnvironment('test')) {
                // Reload the document to reset the app instead of doing app.reset()
                // Faster and less prone to errors, per:
                // http://discuss.emberjs.com/t/is-application-reset-the-recommended-way-to-clear-caches-of-private-data-on-logout/5642/3
                window.location.reload();
            }
        }
    }

});
