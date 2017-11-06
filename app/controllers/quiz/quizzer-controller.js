import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import Question from 'models/question';
import Result from 'models/result';
import context from 'utils/context-utils';

export default Controller.extend(ControllerMixin,{ 

    queryParams: ['animation', 'isExam', 'isReviewRefresh'],

    /**
     * @property indicates when the animation should be shown
     */
    animation: true,

    isExam: null,

    isReviewRefresh: null,

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * Computed Property for question component.
     **/
    questionComponentName: null,

    //Control Status
    /**
     * Indicates the current question index in this quiz
     * @property {number} question index
     */
    questionIndex: null,

    //Manage Templates Vars
    startedTemplate: false,
    analyzingTemplate: false,
    questionTemplate: false,

    /**
     * It could be a Quiz or a Exam instance
     * @property {Quiz|Exam} selected quiz
     */
    selectedQuiz: null,

    /**
     * @property {Question} current question
     */
    currentQuestion: null,

    /**
     * @property {boolean} make all timers in the page stop
     */
    clearTimers: false,

    /**
     * @property {boolean} is this the first question of the exam? If true, use
     * the timeOnCurrentQuestion to set the question timer. If not, the question
     * timer should be reset to 0. If the page is refreshed, this flag will be
     * set to true again.
     */
    isFirstQuestion: true,

    /**
    * This variable is used when the time limit is cero and need to load from the metadata to update the timer
    **/
    questionLoaded: false,

    /*
    * This variable is used in the view file to control when the user change the tab, and back need to load again the time left
    */
    timerUpdating: false,

    /**
    * This var is used when result is saving in the server
    **/
    resultInProgress: false,

    /**
     * @property {boolean} is auto shutoff? If true, end quiz; if not, continue
     */
    isAutoShutoff: false,

    /**
     * This var is used when result is saving in the server
     **/
    progressAlertDisplayed: false,

    /**
     * Property to show the current Index.
     **/
    index: Ember.computed('questionIndex', function(){
        if (this.get('questionIndex') === -1){ //Never Return 0
            return 1;
        }else{
            return this.get('questionIndex') + 1;
        }
    }),

    /**
    Validate if the app is ready to show the Timer
    **/
    showTimer: Ember.computed("selectedQuiz.assignment", "questionLoaded", function(){
        return (this.get("questionLoaded") && this.get("selectedQuiz.assignment.hasTimeLimit"));
    }),

    /**
     * Initialize Values
     **/

    initialize: function () {
        var controller = this;
        if (controller.animation === true){
            controller.wait();
        }
        else{
            controller.set("startedTemplate", false);
            controller.activeQuestion();
        }
    },

    reset: function(){
        var controller = this;
        //controller.set("questionIndex", -1);
        controller.set("startedTemplate", true);
        controller.set("analyzingTemplate", false);
        controller.set("questionTemplate", false);
    },

    /*Reset values when user left the page*/
    resetValues: function(){
        var controller = this;
        controller.set("animation", true); //Control animation

        controller.set("questionIndex",null); //Current question index
        controller.set("startedTemplate", false); //Templates
        controller.set("analyzingTemplate", false);
        controller.set("questionTemplate", false);
        controller.set("currentQuestion", null);
        controller.set("isExam", null);
        controller.set("isReviewRefresh",null);
        controller.set("questionLoaded", false);
        controller.set("timerUpdating", false);
        controller.set("clearTimers", false);
        controller.set("resultInProgress", false);
        controller.set("progressAlertDisplayed", false);
        controller.cleanListener();
    },

    /**
     * Wait 5 seconds to show the animation and after that show the question
     **/
    wait: function () {
        var controller = this;
        var environment = context.get("environment");
        var quizzerProps = environment.getProperty("quizzer");
        var animationTimeout = quizzerProps.animationTimeout;

        //clear values
        controller.reset();

        Ember.run.later(null, function () {
            if (controller.get('isExam') &&
                    !controller.get('selectedQuiz').get('timeLeft') &&
                    controller.get('selectedQuiz').get('timeLimit')) {
                // If the time for an exam has run out, redirect the student to take another exam
                controller.send('takeAnotherExam');
            } else {
                controller.set("startedTemplate", false);
                controller.activeQuestion();
            }
        }, animationTimeout);
    },

    /**
     * Show the first question
     **/
    activeQuestion: function () {
        var controller = this;
        controller.set("questionTemplate", true);
        var quiz = controller.get("selectedQuiz");
        var length = quiz.get("totalQuestions");
        var questionsCompleted = quiz.get("questionsCompleted");
        if (questionsCompleted < length) {
            controller.getNextQuestion();
        } else {
            var isExam = controller.get("isExam");
            if (isExam) {
                controller.transitionToRoute("/student/examHistory/" + controller.get("class.id"));
            } else {
                controller.transitionToRoute("/student/history/" + controller.get("class.id"));
            }
        }
    },

    /**
     * Fix timer if the app lose seconds
     **/
    updateTimeLeft: function(metadata){
        var controller = this;
        if ((controller.get("selectedQuiz").get("hasAssignment") && controller.get("selectedQuiz").get("assignment").get("hasTimeLimit")) ||
            (controller.get("isExam") && controller.get("selectedQuiz").get("hasTimeLimit"))) {
            if (metadata.remainingTime !== 0){
                controller.get("selectedQuiz").set("timeLeft", metadata.remainingTime);
            }else {
                controller.timeOut();
            }
        }
        controller.set("questionLoaded", true);
    },

    /**
     * Get Next Question and change the current question
     **/
    getNextQuestion: function () {
        var controller = this,
            interaction,
            quiz = controller.get('selectedQuiz'),
            isExam = controller.get("isExam") !== null,
            isReviewRefresh = controller.get("isReviewRefresh") !== null,
            promise, questionTime;

        if (isExam) {
            promise = controller.store.query("question", { examId: quiz.get("id") });
        }
        else if (isReviewRefresh){
            promise = controller.store.query("question", { quizId: quiz.get("id"), isReviewRefresh : isReviewRefresh});
        }
        else {
            promise = controller.store.query("question", { quizId: quiz.get("id") });
        }

        promise.then(function (result) {
            Ember.Logger.debug('success on get next question promise');

            var metadata = result.get('meta');

            //Fix timer if the app lose seconds
            controller.updateTimeLeft(metadata);

            if (isExam){
                // Reset the question timer
                if (controller.get('isFirstQuestion')) {
                    questionTime = quiz.get('timeOnCurrentQuestion') || 0;
                    quiz.set('timeOnCurrentQuestion', questionTime);
                    controller.set('isFirstQuestion', false);
                } else {
                    quiz.set('timeOnCurrentQuestion', 0);
                }
            }

            Ember.run(function() {
                // Make sure we update the current question before updating the question index
                controller.set('currentQuestion', result.get('firstObject'));
            });
            interaction = controller.get('currentQuestion').get("interactions").get('firstObject');
            controller.send('shuffle');
            controller.defineTemplateQuestion(interaction.type);
            quiz.set("questionsCompleted", metadata.questionsCompleted);
            controller.set("questionIndex", metadata.questionsCompleted);
        }, function(reason){
            Ember.Logger.debug('failure on get next question promise');
            Ember.Logger.debug(reason);
        });
    },

    /**
     * Define the new Template for Question
     * Vars:
     * Template The questionType name need to active
     **/
    defineTemplateQuestion: function (questionType) {
        var controller = this,
            templateName = null;
        switch (questionType) {
            case Question.CHOICE:
                templateName = 'question-choice';
                break;
            case Question.HOT_SPOT:
                templateName = 'question-hot-spot';
                break;
            case Question.FILL_IN_THE_BLANK:
                templateName = 'question-fill-in-the-blank';
                break;
            case Question.DRAG_AND_DROP:
                templateName = 'question-dragn-drop';
                break;
        }
        controller.set("questionComponentName", templateName);
    },

    /**
     * Get Next Question and When the Quiz is ready show the animation and redirect to Result Page
     **/
    nextStep: function () {
        var controller = this;
        var quiz = controller.get("selectedQuiz");
        var length = quiz.get("totalQuestions");
        var questionIndex = controller.get("questionIndex");
        if (questionIndex < (length - 1)) {
            controller.getNextQuestion();
        } else {
                // Stop the timers so no activity on the page is pending after
                // leaving the route
                controller.set("clearTimers", true);
                controller.set("questionTemplate", false);
                controller.set("analyzingTemplate", true);
                controller.set("progressAlertDisplayed", false);
                controller.transitionToResults();
        }
    },

    transitionToResults: function(){
        var controller = this;
        var isExam = controller.get("isExam") !== null;
        var quiz = controller.get("selectedQuiz");
        var environment = context.get("environment");
        var quizzerProps = environment.getProperty("quizzer");
        var animationTimeout = quizzerProps.animationTimeout;

        var transitionTo = function(){
            var route = isExam ? "/exam/result/" : "/quiz/result/";
            if (controller.get("isReviewRefresh")){
                controller.transitionToRoute(route + quiz.get("id") + "/" + controller.get("class.id") + "?isReviewRefresh=true");
            }
            else{
                controller.transitionToRoute(route + quiz.get("id") + "/" + controller.get("class.id"));
            }
        };

        if (animationTimeout > 0){
            Ember.run.later(null, function () { transitionTo(); }, animationTimeout);
        }
        else{
            transitionTo();
        }
    },

    checkProgressAlert: function(result) {
        var controller = this;
        var quiz = controller.get("selectedQuiz");
        var lastQuestion = quiz.get('examLength') === quiz.get('questionsCompleted');
        if (!controller.progressAlertDisplayed && !lastQuestion) {
            var minimumPerformanceReached = result.get('minimumPerformanceReached');
            if(minimumPerformanceReached !== null) {
                quiz.set('minimumPerformanceReached', minimumPerformanceReached);
                $('#progress-alert').modal('show');
                controller.set('progressAlertDisplayed', true);
            }
        }
    },

    /**
     * Checks if the assignment is already expired
     * @param quiz
     */
    isAssignmentExpired:function(quiz){
        var assignment = quiz.get("assignment");
        if (assignment) {
            var dueDate = assignment.get('dueDate');
            var now = new Date();

            if (dueDate && dueDate < now) {
                return true;
            }
        }
        return false;
    },

    /*
     * Review id the error is Past Due assignment
     */
    checkError:function(error){
        //TODO check error for exams
        var quiz = this.get("selectedQuiz");
        var assignment = quiz.get("assignment");
        var clazz = this.get("class");

        var errorObject = JSON.parse(error.responseText);
        if (errorObject.errors[0].code === "past_due_assignment"){
            this.transitionToRoute("/student/assignment/" + clazz.get('id') + "/" + assignment.get("id"));
        }
    },

    /**
    * Redirect to assigment if the quiz expired
    **/
    redirectToAssignmentDetail: function(){
        var controller = this;
        var quiz = controller.get("selectedQuiz");
        var assignment = quiz.get("assignment");
        var clazz = controller.get("class");
        controller.cleanListener();
        if (assignment){
            controller.transitionToRoute("/student/assignment/" + clazz.get('id') + "/" + assignment.get("id"));
        }
    },

    /**
    * Open Modal when exam expired
    **/
    openTimeExpiredModal:function(){
        this.cleanListener();
        $('#time-expired').modal('show');
    },

    /**
    * Time Out function
    **/
    timeOut: function(){
        var controller = this;
        this.set("clearTimers", true); //Stop Timers
        if (!controller.get("resultInProgress")){
            if (controller.get("isExam")){
                controller.openTimeExpiredModal(); //TimeOut function for exams
            }
            else{
                controller.redirectToAssignmentDetail(); //TimeOut function for quiz
            }
        }
    },

    /**
    * Clean Event Listener if the quiz or exam has time left
    **/
    cleanListener: function(){
        $(document).unbind('visibilitychange');
    },

    /*
     * Ajax call, Get current exam stat
     */
    submitExam: function(){
        var controller = this;
        return new Ember.RSVP.Promise(function(resolve, reject){
            var url = context.getBaseUrl() + "/exams/submitExam";
            var data = { examId: controller.get("selectedQuiz").get('id') };
            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: data,
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });
    },

    actions:{
        quizTimeOut:function() {
            this.timeOut();
        },

        examTimeOut: function() {
            this.timeOut();
        },

        takeAnotherExam: function() {
            var self = this;
            this.get("selectedQuiz").get("class").then( function(clazz) {
                $('#time-expired').modal('hide');
                self.transitionToRoute("exam.create", clazz.get('id'));
            });
        },

        displayAnswerKey: function() {
            var controller = this;
            if (this.submitExam()) {
                controller.set("progressAlertDisplayed", false);
                controller.set("clearTimers", true);
                controller.set("questionTemplate", false);
                // this.resetValues();
                controller.transitionToResults();
            }
        },

       /**
        * Save answer
        **/
        saveResult: function (answer) {
            var controller = this;
            var store = this.store;
            var authenticationManager = context.get('authenticationManager');
            var user = authenticationManager.getCurrentUser(); //current user
            var isExam = controller.get("isExam") !== null;
            var quiz = controller.get("selectedQuiz");

            if (!controller.isAssignmentExpired(quiz)) {
                var record = Result.createResultRecord(store, {
                    correct: true,
                    answer: answer,
                    student: user,
                    question: controller.get("currentQuestion"),
                    quiz: !isExam ? quiz : undefined,
                    exam: isExam ? quiz : undefined,
                    isReviewRefresh: controller.get("isReviewRefresh")
                });

                record.then(function (result) {
                    controller.set("resultInProgress", true);
                    var promise = result.save();
                    promise.then(function (result) {
                        controller.set("resultInProgress", false);
                        if (result.get('id')) {
                            if(result.get('examAutoShutoff')) {
                                $('#auto-shutoff').modal('show');
                                // Stop the timers so no activity on the page is pending after
                                controller.set("clearTimers", true);

                                $('#auto-shutoff').on('hidden.bs.modal', function () {
                                    // leaving the route
                                    controller.set("questionTemplate", false);
                                    controller.set("analyzingTemplate", true);
                                    controller.transitionToResults();
                                });
                            } else {
                                if (controller.isExam && quiz.get('inProgressAlert')) {
                                    controller.checkProgressAlert(result);
                                }
                                controller.nextStep();
                            }
                        }
                    }, function(error){controller.checkError(error);});
                },function(reason){
                    if (reason.status === 400){
                        controller.timeOut();
                    }
                });
            } else {
                controller.redirectToAssignmentDetail(); //If is past Due go to the assignment summary
            }
        },

        shuffle: function () {
            var question = this.get("currentQuestion");
            question.get("interactions").forEach(function (item) {
                if (item.shuffle) {
                    var answerChoices = item.answerChoices;
                    var newChoices = Question.shuffle(answerChoices);
                    newChoices = Question.order(newChoices);
                    answerChoices.setObjects(newChoices); // set objects and fires observables
                }
            });
        },
    }

});
