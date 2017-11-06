import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
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