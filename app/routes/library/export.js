
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import FeatureMixin from 'sakurai-webapp/mixin/feature-mixin';

export default Ember.Route.extend(
    ResetScroll,
    FeatureMixin,{

	model: function(params) {
        var store = this.store;
        
        return Ember.RSVP.hash({
            questionSet: store.find("questionSet", {"questionSetId": params.qsId})
        });
	},

	setupController: function(controller, model) {
        var questionSet = null;

        if (model.questionSet){
            questionSet = model.questionSet.get('firstObject');
            controller.set('questionSet', questionSet);
            controller.set("questions", questionSet.get("questions"));
        }
	}

});
