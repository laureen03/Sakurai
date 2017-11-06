/**
 * Admin route
 * @type {SakuraiWebapp.AdminRoute}
 */

import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
	ResetScroll,{

    model: function() {
        var store = this.store;
        var authenticationManager = context.get('authenticationManager');
        var publisher = authenticationManager.getCurrentPublisher();
        return store.query("product", {publisherName: publisher.get("name")});
    },

    setupController: function(controller, model) {
        controller.set("products", model.sortBy('title'));
    }

});