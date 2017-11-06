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
            sections : store.query("section", {classId: params.classId}),
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

        controller.set("selectedTermTaxonomy", Section.NURSING_TOPICS);
        controller.set("termTaxonomyTypeOptions", selectOptions);

        this.controllerFor('header').set("menu", "menu-practiceQuiz");
        controller.set("numQuestions", product.get('quizLengths'));
        controller.set("numQuestionsRR", product.get('quizLengthsRR'));
        controller.set("sections", model.sections);
        controller.set("class", model.class);

        if (model.reviewRefreshClassSettings.get("length") === 1){
            controller.set("reviewRefreshClassSettings",model.reviewRefreshClassSettings.get('firstObject'));
        }
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }
});
