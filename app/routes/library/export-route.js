import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import FeatureMixin from 'mixin/feature-mixin';

export default Route.extend(
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
