/**
 * Base Instructor Route for all sub route in the instructor module
 * @type {*}
 */
import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';
import Class from 'models/class';

export default Route.extend(
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