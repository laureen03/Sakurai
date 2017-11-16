
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
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
