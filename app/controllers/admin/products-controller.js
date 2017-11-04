SakuraiWebapp.AdminProductsController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin, {
    admin: Ember.inject.controller(),

    /**
     * @property {Ember.A} alias of current instructor products from injected admin controller
     */
    products : Ember.computed.alias("admin.products")

});