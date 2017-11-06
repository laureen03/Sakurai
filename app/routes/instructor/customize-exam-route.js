import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.store;

        var authenticationManager = context.get('authenticationManager');
        authenticationManager.setImpersonatedUser(false);

        return Ember.RSVP.hash({
                class : store.find('class', params.classId),
        });
    },


    /**
     * Setup controller
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
        controller.set("class", model.class);
        //controller.set('classExamOverallSettings', model.classExamOverallSettings);
    }
});
