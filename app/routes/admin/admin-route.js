/**
 * Admin route
 * @type {SakuraiWebapp.AdminRoute}
 */
SakuraiWebapp.AdminRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    model: function() {
        var store = this.store;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var publisher = authenticationManager.getCurrentPublisher();
        return store.query("product", {publisherName: publisher.get("name")});
    },

    setupController: function(controller, model) {
        controller.set("products", model.sortBy('title'));
    }

});