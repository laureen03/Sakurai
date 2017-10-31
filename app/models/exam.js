import DS from 'ember-data';
import Ember from "ember";
import Exam from "../models/exam";
import Context from '../utils/context-utils';

export default DS.Model.extend({

    /**
     * @property {Date} started on
     */
    startedOn: DS.attr('date'),

    /**
     * @property {Date} ended on
     */
    endedOn: DS.attr('date'),

    /**
     * @property {number} questions completed
     */
    questionsCompleted: DS.attr('number'),

    /**
     * @property {number} correct results count
     */
    correctResultsCount: DS.attr('number'),

    /**
     * @property {SakuraiWebapp.User} user
     */
    student: DS.belongsTo('user', { async: true }),

    /**
     * @property {SakuraiWebapp.Class} class
     */
    class: DS.belongsTo('class', { async: true }),

    /**
     * @property {number} exam length
     */
    examLength: DS.attr('number'),

    /**
     * @property {number} time left to complete exam (in seconds)
     */
    timeLeft: DS.attr('number'),

    /**
     * @property {number} time limit for completing the exam (in minutes)
     */
    timeLimit: DS.attr('number'),

    /**
     * @property {number} Mastery Level
     */
    masteryLevel: DS.attr('number'),
    /**
     * @property {number} time spent working on current question (in seconds)
     */
    timeOnCurrentQuestion: DS.attr('number'),

    /**
     * @property {number} time spent working on exam (in seconds)
     */
    timeOnExam: DS.attr('number'),

    /**
     * @property {number} time to complete the exam (in seconds)
     */
    completedIn: DS.attr('number'),

    /**
     * @property {SakuraiWebapp.Assignment} the exam assignment
     */
    assignment: DS.belongsTo('assignment', { async: true }),

    /**
     * @property {Number} Average of time taken with each question
     */
    averageTimeOnQuestion: DS.attr('number'),

    /**
     * @property {Number} Index Exam was taken
     */
    examIndex: DS.attr('number'),

    /**
    * @property {Boolean} autoshutoff
    */
    autoShutoff: DS.attr('boolean'),

    /**
     * @property {boolean} Indicate if the exam shows in progress alert once enough performance data is generated
     */
    inProgressAlert: DS.attr('boolean'),

    /**
     * @property {bool} If student reached minimum performance reached
     **/
    minimumPerformanceReached: DS.attr('boolean'),

    /**
     * Returns the current question index
     * @return {number} index
     */
    questionIndex: Ember.computed('questionsCompleted', function(){
        return this.get("questionsCompleted") - 1;
    }),

    /**
     * Return the total question for this exam
     */
    totalQuestions: Ember.computed('examLength', function(){
        return this.get("examLength");
    }),

    /**
     * Indicates when the exam has an assignment
     */
    hasAssignment: Ember.computed('assignment', function(){
        return this.get("assignment").get("content") !== null;
    }),

    /**
     * Indicates when the exam has a time limit
     */
    hasTimeLimit: Ember.computed('timeLimit', function(){
        return  this.get("timeLimit") > 0;
    }),

    /**
     * Indicates id the exam is complete
     */
    isComplete: Ember.computed("examLength", "questionsCompleted", function(){
        var assignment = this.get("assignment");
        if((assignment !== null && assignment.get('isAutoShutoff')) || this.get('inProgressAlert')) {
            return this.get("completedIn") !== 0;
        } else {
            return  this.get("examLength") === this.get("questionsCompleted");
        }
    }),

    /**
     * Indicates id the exam is autoshutoff
     */
    isAutoShutoff: Ember.computed('autoShutoff', function(){
        var assignment = this.get("assignment");
        if(assignment !== null) {
            return assignment.get('isAutoShutoff');
        } else {
            return this.get("autoShutoff");
        }
    }),

    hasTimedOut: Ember.computed("timeLimit", "timeLeft", function(){
        var timeLimit = this.get("timeLimit"),
            timeLeft = this.get("timeLeft");

        return timeLimit && !timeLeft;
    }),

    /**
        Return 0 when the mastery level is not nessesary and is displayed like empty field
    **/
    sortableMasteryLevel: Ember.computed('masteryLevel', function(){
        return  (!this.get("isComplete"))? 0 : this.get("masteryLevel");
    }),

    /**
     * Resolve the exam dependencies
     */
    resolve: Ember.computed(function(){
        return Ember.RSVP.hash({
            "class": this.get("class"),
            "student": this.get("student"),
            "assignment": this.get("assignment")
        });
    })
});

Exam.reopenClass({
    /**
     * Creates a new exam record
     * @param store
     * @param data quiz data
     */
    createExamRecord: function(store, data){
        return new Ember.RSVP.Promise(function(resolve){
            var studentId = data.student.get('id');
            var classId = data.class.get('id');
            var assignment = data.assignment;

            var exam = store.createRecord("exam", {
                examLength: data.examLength,
                timeLimit: data.timeLimit,
                inProgressAlert: data.inProgressAlert
            });

            Ember.RSVP.hash({
                assignment: (assignment) ? store.find("assignment", assignment.get("id")) : undefined,
                user: store.find("user", studentId),
                class: store.find("class", classId)
            }).then(function (hash) {
                    exam.set('student', hash.user);
                    exam.set('class', hash.class);
                    exam.set('assignment', hash.assignment);
                    resolve(exam);
                });
        });
    },

    /*
    * Ajax call, Get Time left of the exam
    */
    getTimeRemaining: function(_examId){
        return new Ember.RSVP.Promise(function(resolve, reject){
            var url = Context.getBaseUrl() + "/exams/retrieveTimeRemaining";
            var data = { examId: _examId };

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
    }
});
