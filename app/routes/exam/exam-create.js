
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";

export default Ember.Route.extend(
    ResetScroll,{
    model: function(params) {
        var store = this.store;
        return Ember.RSVP.hash({
            class : store.find("class", params.classId)
        });
    },

    afterModel:function(model){
        return model.class.get('product');
    },

    setupController: function(controller, model) {
        var product =  model.class.get('product');
        controller.set('class',model.class);
        controller.set("numQuestions", product.get('examLengths'));
        controller.set("minutesLimit", product.get('examTimeLimits'));
        controller.set("numQuestionsSelected", product.get('examLengths')[0]);
        controller.set("minLimitSelected", product.get('examTimeLimits')[0]);
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }
});