import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import ReviewRefreshQuiz from "models/review-refresh-quiz";
import Section from "models/section";
import Quiz from "models/quiz";
import context from 'utils/context-utils';


export default Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin,{

    queryParams: ["cs", "activeRR"],

    headerClasses: Ember.inject.controller(),

    /**
    * @ Property {array} get rules for topics selected vs amount od questions
    **/
    rapidML_rules: [
        {"questions": 5, "maxTopics": 1},
        {"questions": 10, "maxTopics": 1},
        {"questions": 20, "maxTopics": 4},
        {"questions": 50, "maxTopics": 10},
    ],
    
    /**
     * @property Defines which chapter is selected by default
     */
    cs: null,

    /**
     * @property if Quiz Review and Refresh is active.
     */
    activeRR: null,

    /**
     * This is a tree of sections, the first level are units with children
     * @property {Section[]} sections
     */
    sections: [],

    /**
     * List of Number of question the user can choose for
     * @property []
     **/
    numQuestionsAvailable: Ember.computed('isReviewRefresh', function(){
        //Reset the select field, if not the old value will sometimes get sent to quiz creattion
        //There are more the 4 repetitions of this line in this controller.
        //Is there a better way of handling this?
        this.set("numQuestionsSelected", 5);
        return this.get('isReviewRefresh') ? this.get("numQuestionsRR"): this.get("numQuestions");
    }),

    /**
     * @property {number} selected num of questions
     */
    numQuestionsSelected: 5,

    /**
     * @property {boolean} indicates when the message error should be displayed
     */
    noChaptersSelectedError: false,

    /**
     * @property {Class} selected class
     */
    class: null,
    /**
     * @property {menuSelected} selected Menu
     */
    menuSelected: "",

    /**
     * @property termTaxonomyTypeOptions
     * Object with the headers for drop down menu
     * Used only if metadata is allowed
     * Return Object
     */
    termTaxonomyTypeOptions: null,

    /**
     * @property {string} selectedTermTaxonomy
     * Integer with the selected id from termTaxonomyTypeOptions
     * Used only if metadata is allowed
     */
    selectedTermTaxonomy: null,

    /**
    Failed Message when try start quiz
    **/
    failedMessage: "",

    /**
    Failed Message when try start quiz
    **/
    rapidML_message: "",

    /**
    * @property {Boolean} Flag to control if R&R is on or of for the quiz.
    **/
    isReviewRefresh: false,

    /*
    * Property {reviewRefreshClassSetting} Manage the quiz type radio
    */
    reviewRefreshClassSettings: null,

    /*
    * Property {notEnoughQuestions} not enough questions array with length of quiz selected
    */
    notEnoughQuestions: [],

    /**
     * Updates metadata when the selection is changed
     */
    updateMetadata: Ember.observer('selectedTermTaxonomy', function(){
        var controller = this;
        var type = controller.get('selectedTermTaxonomy');
        if (type !== Section.NURSING_TOPICS){
            var clazz = this.get("class");
            controller.transitionToRoute("/student/metadata/" + clazz.get('id') + "?type=" + type + "&activeRR=" + controller.get("activeRR"));
        }
    }),

    metadataDropDownEnabled: Ember.computed('isMetadataAllowed', function(){
        return  this.get("isMetadataAllowed") &&
                this.get("termTaxonomyTypeOptions").length > 1;
                //the drop down is not necessary with one option
    }),

    /**
     * Gets selected sections
     * @returns {Section[]}
     */
    getSelectedChapters: function () {
        var ids = $("#chapters input[name=chapters]:checked").map(function () {
            return $(this).val();
        });

        var units = this.get("sections");
        var chapters = [];
        units.forEach(function (unit) {
            chapters = chapters.concat(unit.findChaptersByIds(ids));
        });
        return chapters;
    },

    resetValues: function(){
        this.set("numQuestionsSelected", 5); //Default Value for Practice Quiz
        $('.chapters-container input[type=checkbox]').prop('checked', false);
        this.set("cs", null);
        this.set("failedMessage","");
        $('.chapters-container .disabled').removeClass("disabled");
        this.set("isReviewRefresh", false);
        this.set("reviewRefreshClassSettings", null);
        this.set("notEnoughQuestions", []);
    },

    /**
    * Validate if the rules of questions vs taxonomies selested are fine
    **/
    validate_rapid_ML: function(lengthTopics, amountQuestions){
        var controller = this,
            rules = controller.get("rapidML_rules"),
            isValid = true;

        rules.forEach(function(currentValue){
            if (amountQuestions === currentValue.questions && lengthTopics> currentValue.maxTopics){
                controller.set("rapidML_message", I18n.t("quiz.failedRapidML", {count:currentValue.maxTopics, amount : currentValue.maxTopics, questions : currentValue.questions}));
                $('.chapters-container input[type=checkbox]').prop('checked', false);
                isValid = false;
            } 
        });
        return isValid;
    },

    actions: {
        createQuiz: function (data) {
            var controller = this,
                store = controller.store,
                record = null;
            
            controller.set("noChaptersSelectedError", false);

            var selectedChapters = controller.getSelectedChapters();
            var validAmountQuestion = controller.validate_rapid_ML(selectedChapters.length, controller.get("numQuestionsSelected"));

            if ((selectedChapters.length)> 0 && (validAmountQuestion))  {
                var authenticationManager = context.get('authenticationManager');
                var user = authenticationManager.getCurrentUser();
                
                if (controller.get("isReviewRefresh")) {
                    record = ReviewRefreshQuiz.createQuizRecord(store, {
                        quizLength: controller.get("numQuestionsSelected"),
                        chapters: selectedChapters,
                        student: user,
                        class: controller.get('class')
                    });
                }else{
                    record = Quiz.createQuizRecord(store, {
                    quizLength: controller.get("numQuestionsSelected"),
                        chapters: selectedChapters,
                        student: user,
                        class: controller.get('class')
                    });
                }

                record.then(function(quiz){
                    var promise = quiz.save();
                    promise.then(function (quiz) {
                        if (quiz.get('id')) {
                            controller.trigger('asyncButton.restore', data.component);
                            controller.set("failedMessage", "");
                            if (!controller.get('isReviewRefresh')){
                                controller.transitionToRoute("/quiz/quizzer/" + quiz.get('id') + "/" + controller.get("class.id"));
                            }
                            else{
                                controller.transitionToRoute("/quiz/quizzer/" + quiz.get('id') + "/" + controller.get("class.id") + "?isReviewRefresh=true");
                            }
                        }
                    },function(reason){
                        controller.trigger('asyncButton.restore', data.component);
                        if ((reason.status === 400) && ($.parseJSON(reason.responseText).errors[0].code==="missing_questions")) {
                            var message = $.parseJSON(reason.responseText).errors[0].info; 
                            var n = message.lastIndexOf(" ");
                            var code = message.substr(n + 1, message.length-1); 
                            controller.store.find("section", code).then(function(){
                                controller.set("failedMessage", controller.get("numQuestionsSelected") > 5 ? I18n.t('quiz.failedMessage') : I18n.t('quiz.failedFiveQuestionMessage'));
                                controller.set("numQuestionsSelected", 5);
                                $('.questions-desc select').attr('disabled', true);
                                var ids = $("#chapters input[name=chapters]:checked").map(function () {
                                    return $(this).val();
                                });
                                var ids_str = ids.get().sort().join();
                                var hasChapters = controller.get("notEnoughQuestions").findBy('ids', ids_str);
                                if(!hasChapters) {
                                    controller.get("notEnoughQuestions").pushObject(Ember.Object.create({ids: ids_str, length: controller.get("numQuestionsSelected")}));
                                }
                            });
                        }
                    });
                });
            }
            else{
                controller.trigger('asyncButton.restore', data.component);
                if (!validAmountQuestion){
                    $("#rapidMLErrorPopUp").modal("show");
                }
                else{
                    controller.set("noChaptersSelectedError", true);
                }
            }
        },

        onSetInactive: function(inactiveTopics, isReviewRefresh, autoQuizType){
            var controller = this;
            controller.set("numQuestionsSelected", 5);
            controller.set('isReviewRefresh', isReviewRefresh);
            controller.set('activeRR', isReviewRefresh);
            if (!autoQuizType) {
                $('.chapters-container input[type=checkbox]').prop('checked', false);
                controller.set("cs", null);
            }
            
            if (inactiveTopics.length > 0){
                inactiveTopics.forEach(function(topicId) {
                    $('.item_' + topicId).addClass("disabled");
                });
            }    
            else{
                $('.chapters-container .disabled').removeClass("disabled");
            }
        },

        selectChapter: function() {
            var ids = $("#chapters input[name=chapters]:checked").map(function () {
                return $(this).val();
            });
            var ids_str = ids.get().sort().join();
            var hasChapters = this.get("notEnoughQuestions").findBy('ids', ids_str);
            if(!hasChapters) {
                this.set("failedMessage", "");
                $('.questions-desc select').attr('disabled', false);
            } else {
                this.set("failedMessage", hasChapters.get('length') > 5 ? I18n.t('quiz.failedMessage') : I18n.t('quiz.failedFiveQuestionMessage'));
                this.set("numQuestionsSelected", 5);
                $('.questions-desc select').attr('disabled', true);
            }
        }
    }
});
