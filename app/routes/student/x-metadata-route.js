import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import Section from "models/section";
import TermTaxonomy from 'models/term-taxonomy';

export default Route.extend(
    ResetScroll,{
    model: function(params) {
        var store = this.store;
        
        //TODO: This is a workaround because store.unloadAll('reviewRefreshClassSetting')is failing
        //by a bug of ember-data beta.16, Please review again when undate the Ember data.
        //https://github.com/emberjs/data/issues/2982
        var records = store.peekAll('reviewRefreshClassSetting');
        records.forEach(function(record) {
          store.unloadRecord(record);
        });

        return Ember.RSVP.hash({
            class : store.find("class", params.classId),
            reviewRefreshClassSettings: store.query("reviewRefreshClassSetting", {classId: params.classId}),
            params: params
        });
    },

    afterModel:function(model){
        return model.class.get('product');
    },

    setupController: function(controller, model) {
        var product =  model.class.get('product');
        // metadata types supported
        var selectOptions = TermTaxonomy.findTermTaxonomyTypes(product);
        controller.set("class", model.class);
        var selectedTermTaxonomy = controller.get("type") || product.get('defaultDataType');

        if (selectedTermTaxonomy === Section.NURSING_TOPICS){
            //redirecting to topics/sections controller
            this.transitionTo("student.section", model.class.get('id'));
        }

        controller.set("selectedTermTaxonomy", selectedTermTaxonomy);
        controller.set("termTaxonomyTypeOptions", selectOptions);
        controller.set("numQuestions", product.get('quizLengths'));
        controller.set("numQuestionsRR", product.get('quizLengthsRR'));

        if (model.reviewRefreshClassSettings.get("length") === 1){
            controller.set("reviewRefreshClassSettings",model.reviewRefreshClassSettings.get('firstObject'));
        }
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }


});
