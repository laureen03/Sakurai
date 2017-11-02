SakuraiWebapp.LibraryExportController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin, {

    /**
     * @property {QuestionSet} Selected Question Set (Question Colletion)
     */
    questionSet: null,

    /**
     * @property {question} Question for selected QC
     */
    questions: null,

});