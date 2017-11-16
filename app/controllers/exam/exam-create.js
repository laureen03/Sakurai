
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import Exam from 'sakurai-webapp/models/exam';
import context from 'sakurai-webapp/utils/context';
import DateUtil from 'sakurai-webapp/utils/date-util';

export default Ember.Controller.extend(
    ControllerMixin, 
    FeatureMixin,{

    headerClasses: Ember.inject.controller(),

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
	* List of Number of question the user can choose for exam
    **/
    numQuestions: null,

    /**
     * @property {number} selected num of questions
     */
    numQuestionsSelected: null,

    /**
    * List of Minutes for Time Limit the user can choose for exam
    **/
    minutesLimit: null,

    /*List of Minutes*/
    minutesLimitList: Ember.A(),

    /**
     * @property {number} selected num of questions
     */
    minLimitSelected: null,

    /**
     * @property {boolean} Indicate if the exam shows in progress alert once enough performance data is generated
     */

    inProgressAlert: null,

    /**
     * Allow in progress alert Product Settings
     */
    allowInProgressAlert: Ember.computed(function(){
        return this.class.get('product').get("isExamInProgressAlertAllowed");
    }),

    /**
     * @property {String} Return text for What's this? Nclex Practice Exam in progress alert
     */
    inProgressAlertDescription: Ember.computed('product.name', function(){
        /*The name of the product, is the same of the label in the Translations file, because only two products
         allow exams, but if in the future another message needs to hardcode another label is better create a
         property into the product*/
        var name = this.class.get('product').get("name").replace(/-/g, "");
        return I18n.t("exam." + name + ".inProgressAlertDescription");
    }),

    /**
     * @property {String} Return text progress alert warning label
     */
    getInProgressAlertWarningLabel: Ember.computed('product.name', function(){
    /*The name of the product, is the same of the label in the Translations file, because only two products
     allow exams, but if in the future another message needs to hardcode another label is better create a
     property into the product*/
        var name = this.class.get('product').get("name").replace(/-/g, "");
        return I18n.t("exam." + name + ".inProgressAlertWarningLabel");
    }),

    /**
    *    Create a list of index available to order the questions.
    **/
    loadMinutesLimitList: Ember.observer('minutesLimit.[]', function(){
        var dateUtil = new DateUtil();
        var minutesLimitList = this.get("minutesLimitList");
        minutesLimitList.clear();
        var controller = this;
        controller.get("minutesLimit").forEach(function(minutes){
            minutesLimitList.pushObject({"value": minutes , "label": dateUtil.convertToTimeStringWithFormat(minutes, "minutes", "HM")});
        });
    }),


    resetValues: function(){
        this.set("numQuestionsSelected", null); //Default Value for Exam Quiz
        this.set("minLimitSelected", null);
        this.set("inProgressAlert", null);
    },

    /**
     Verify if the user can edit the limit
     **/
    disableInProgressAlert: Ember.computed("numQuestionsSelected", "numQuestions", function(){
        var controller = this;
        var numQuestionList = controller.get("numQuestions");
        var inProgressAlertRadio = $('.exam-content input[name=inProgressAlert]:checked');
        var inProgressAlertRadioOff = $('.exam-content #progressAlertRadioOff');
        var inProgressAlertLabel = $("#inProgressAlertOn").addClass('disabled');

        if (controller.get("numQuestionsSelected") < numQuestionList[1]) {
            inProgressAlertRadio.prop('checked', false);
            inProgressAlertLabel.addClass('disabled');
            inProgressAlertRadioOff.prop('checked', true);
            return true;
        } else {
            inProgressAlertLabel.removeClass('disabled');
            return false;
        }
    }),

    actions:{
        checkTimeLimit: function(){
            //alert("sirve");
        },

        createExam: function(data){
            var controller = this;
            var store = controller.store;
            var examLength = this.get("numQuestionsSelected");
            //Set Time Limit
            var selectedTimeLimit = $('.exam-content input[name=timeLimit]:checked').val();
            var timeLimit = (selectedTimeLimit === '1') ? controller.get('minLimitSelected') : 0;
            var inProgressAlert = ($('.exam-content input[name=inProgressAlert]:checked').val() === '1') ? true : false;


            if (examLength > 0){
                var authenticationManager = context.get('authenticationManager');
                var user = authenticationManager.getCurrentUser();
                var record = Exam.createExamRecord(store, {
                    examLength: examLength,
                    timeLimit: timeLimit,
                    student: user,
                    class: controller.get('class'),
                    inProgressAlert: inProgressAlert,

                });

                record.then(function(exam){
                    var promise = exam.save();
                    promise.then(function (exam) {
                        if (exam.get('id')) {
                            controller.trigger('asyncButton.restore', data.component);
                            controller.transitionToRoute("/quiz/quizzer/" + exam.get('id') + "/" + controller.get("class.id") + "?isExam=true");
                        }
                    });
                });
            }

        }
    }

});

