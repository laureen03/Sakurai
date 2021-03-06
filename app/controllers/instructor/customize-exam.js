
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';

export default Ember.Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin,{
        //queryParams: ['classId'],
        headerClasses: Ember.inject.controller(),
        instructor: Ember.inject.controller(),
        instructorController: Ember.computed.alias("instructor"),

        classId: null,

        /**
         * @property {Class} the class
         */
        class: null,

        /**
        * @property {String} customize option 
        **/
        customize: "customize_setting",

        customOverallExamSettingsDescription: Ember.computed('class', function(){
            /*The name of the product, is the same of the label in the Translations file, because only two products
             allow exams, but if in the future another message needs to hardcode another label is better create a
             property into the product*/
            var name = this.get("class").get("product.name").replace(/-/g, "");
            return I18n.t("assignExam." + name + ".customizeInstruction");
        }),

        actions:{
            continueManageExam: function(){
                var controller = this;
                var nextStep = controller.get('customize');

                if(nextStep === 'customize_setting') {
                    controller.transitionToRoute("/instructor/overallExamSettings/" + controller.get("class").get("id"));
                } else {
                    controller.transitionToRoute("/instructor/assignExam/" + controller.get("class").get("id"));
                }
            }
        }
    });
