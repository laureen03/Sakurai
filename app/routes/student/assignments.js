
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
    ResetScroll,{
    model: function(params) {
        var store = this.store;
        
        var userId;
        var authenticationManager = context.get('authenticationManager');
        userId = authenticationManager.getActiveUserId();
       
        return Ember.RSVP.hash({
            assignments : store.query("assignment", {classId:params.classId,studentId: userId}),
            class : store.find("class", params.classId)
        });
    },

    setupController: function(controller, model) {
        controller.set("product", model.class.get("product"));
        controller.set("class", model.class);
        controller.loadAssignments(model.assignments);
    }

});