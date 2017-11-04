import Controller from '@ember/controller';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';

export default Controller.extend(
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