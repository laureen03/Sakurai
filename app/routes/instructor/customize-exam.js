
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
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
