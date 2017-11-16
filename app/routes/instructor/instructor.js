/**
 * Base Instructor Route for all sub route in the instructor module
 * @type {*}
 */
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';
import Class from 'sakurai-webapp/models/class';

export default Ember.Route.extend(
    ResetScroll,{
    model: function() {
        var store = this.store;
        var authenticationManager = context.get('authenticationManager');
        var publisher = authenticationManager.getCurrentPublisher();
        var user = authenticationManager.getCurrentUser();
        var product = authenticationManager.getCurrentProduct();
        return authenticationManager.isSSO() ?
            Class.getAllClassesByProductAndUser(store, product.get("id"), user.get("id")) :
            Class.getAllClassesByPublisherAndUser(store, publisher.get('id'), user.get('id'));
    },

    setupController: function(controller, model) {
        controller.set("classes", model);
    }

});