/**
 * Admin Home route
 * @type {SakuraiWebapp.AdminProductsRoute}
 */
SakuraiWebapp.AdminRrSettingsRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
	model: function(params) {
        var store = this.store;
        return new Ember.RSVP.Promise(function(resolve, reject){
            store.find('class', params.classId).then( function(_class) {
                    _class.get("product").then( function(_product) {
                        Ember.RSVP.hash({
                            class: _class,
                            product: store.find("product",_product.id),
                        }).then(resolve, reject);
                }, reject);
            }, reject);
        });
    },

    setupController: function(controller, model) {
        controller.set('product', model.product);
        controller.set('class', model.class);
        controller.initValues(model.product);
    },

});