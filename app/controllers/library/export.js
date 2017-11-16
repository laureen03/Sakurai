import Ember from "ember";
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';

export default Ember.Controller.extend(
    ControllerMixin,
    FeatureMixin, {

    /**
     * @property {QuestionSet} Selected Question Set (Question Colletion)
     */
    questionSet: null,

    /**
     * @property {question} Question for selected QC
     */
    questions: null,

});