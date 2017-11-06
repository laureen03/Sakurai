import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";

export default Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.store;

        //TODO: This is a workaround because store.unloadAll('ClassExamOverallSetting') is failing
        //by a bug of ember-data beta.16, Please review again when undate the Ember data.
        //https://github.com/emberjs/data/issues/2982
        var records = store.peekAll('ClassExamOverallSetting');
        records.forEach(function(record) {
          store.unloadRecord(record);
        });

        return new Ember.RSVP.Promise(function(resolve, reject){
            var hashObject = {
                class : store.find('class', params.classId),
                classExamOverallSettings: store.query('classExamOverallSetting', {classId: params.classId})
            };

            Ember.RSVP.hash(hashObject).then(function(hash){
                resolve(hash);
            }, reject);
        });

    },

    /**
     * Setup controller
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
        var product =  model.class.get('product');
        var classExamOverallSettings = model.classExamOverallSettings;
        controller.set("nclexProficiencyLevels", product.get('nclexProficiencyLevels'));
        controller.set("class", model.class);
        if (classExamOverallSettings && classExamOverallSettings.nextObject(0)) {
            controller.set("classExamOverallSettings", classExamOverallSettings.nextObject(0));
        } else {
            controller.initClassExamOverallSettings();
        }

        controller.set("hideThresholdLabels", controller.get("classExamOverallSettings").get('hideThresholdLabels'));
        controller.set("customThreshold", controller.get("minimumThreshold"));
    },
});
