/**
 * Admin route
 * @type {SakuraiWebapp.AdminRoute}
 */

import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
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