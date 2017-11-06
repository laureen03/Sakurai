import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.store;

            var authenticationManager = context.get('authenticationManager');
            var user = authenticationManager.getCurrentUser(),
                userId = user.get("id");
            
            return Ember.RSVP.hash({
                assignments : store.query("assignment", {classId:params.classId, instructorId:userId}),
                product : store.find("product", params.productId),
                class : store.find('class', params.classId),
                classId : params.classId
            });
    },

    setupController: function(controller, model) {
        controller.set("product", model.product);
        controller.set('classId', model.classId);
        controller.set("class", model.class);
        controller.loadAssignments(model.assignments);
    },

    deactivate: function() {
        var controller = this.get("controller");
        controller.resetValues();
    }
});
