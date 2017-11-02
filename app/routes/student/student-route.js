/**
 * Base Student Route for all sub route in the student module
 * @type {*}
 */
SakuraiWebapp.StudentRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
    model: function() {
        var store = this.store;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var publisher = authenticationManager.getCurrentPublisher();
        var user = authenticationManager.getCurrentUser();
        var product = authenticationManager.getCurrentProduct();
        return authenticationManager.isSSO() ?
            SakuraiWebapp.Class.getActiveClassesByProductAndUser(store, product.get("id"), user.get("id")) :
            SakuraiWebapp.Class.getActiveClassesByPublisherAndUser(store, publisher.get('id'), user.get('id'));
    },

    setupController: function(controller, model) {
        controller.set("classes", model);
    }

});