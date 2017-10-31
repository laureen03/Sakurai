import DS from 'ember-data';
import Ember from "ember";
import Quiz from "../models/quiz";
import Context from '../utils/context-utils';

export default DS.Model.extend({

    startedOn: DS.attr('date'),
    startedOnTimeStamp: DS.attr('number'),
    endedOn: DS.attr('date'),
    questionsCompleted: DS.attr('number'),
    correctResultsCount: DS.attr('number'),
    student: DS.belongsTo('user', { async: true }),
    class: DS.belongsTo('class', { async: true }), //TODO class_model
    chapters: DS.hasMany('chapter', { async: true }),
    termTaxonomies: DS.hasMany('termTaxonomy', { async: true }),
    assignment: DS.belongsTo('assignment', { async: true }),
    quizLength: DS.attr('number'),
    quizIndex: DS.attr('number'),

    /**
     * @property {integer} time left in seconds for quiz with time limit
     */
    timeLeft: DS.attr('number'),

    /**
     * Indicates when the assignment is available
     */
    isComplete: Ember.computed("quizLength", "questionsCompleted", function(){
        return this.get("quizLength") === this.get("questionsCompleted");
    }),

    /**
     * gets number complete.
     * @todo this should be in the template or helper and not in the model
     */
    numComplete: Ember.computed("quizLength", "questionsCompleted", "correctResultsCount", function(){
        if (this.get("isComplete")){
            return this.get("correctResultsCount") + " / " + this.get("quizLength") ;
        }
        else{
            return " - / " + this.get("quizLength") ;
        }
    }),

    /**
     * knows if the quiz is from an assignment
     */
    isQuestionCollectionQuiz: Ember.computed('assignment', function(){
        var assignment = this.get("assignment");
        return  assignment !== null &&
                assignment.get("isQuestionCollectionAssignment");
    }),

    /**
     * Indicates if the quiz has chapters
     * @returns {*|boolean}
     */
    hasChapters: Ember.computed('chapters', function(){
        var chapters = this.get("chapters");
        return chapters && chapters.get("length") > 0;
    }),

    /**
     * Indicates if the quiz has term taxonomies
     * @returns {*|boolean}
     */
    hasTermTaxonomies: Ember.computed('termTaxonomies', function(){
        var termTaxonomies = this.get("termTaxonomies");
        return termTaxonomies && termTaxonomies.get("length") > 0;
    }),

    /**
     * Indicates if the quiz has an assignment
     */
    hasAssignment: Ember.computed('assignment', function(){
        return this.get("assignment").get("content") !== null;
    }),

    /**
     * Returns the current question index
     * @return {number} index
     */
    questionIndex: Ember.computed('questionCompleteddueDate', function(){
        return this.get("questionsCompleted") - 1;
    }),

    /**
     * Return the total question for this quiz
     */
    totalQuestions: Ember.computed('quizLength', function(){
        return this.get("quizLength");
    })



});

Quiz.reopenClass({
    /**
     * Creates a new quiz record
     * @param store
     * @param data quiz data
     */
    createQuizRecord: function(store, data){
        return new Ember.RSVP.Promise(function(resolve){
            var studentId = data.student.get('id');
            var classId = data.class.get('id');
            var assignmentId = data.assignment ? data.assignment.get("id") : undefined;

            var quiz = store.createRecord("quiz", {
                quizLength: data.quizLength
            });

            Ember.RSVP.hash({
                    user: store.find("user", studentId),
                    class: store.find("class", classId),
                    assignment: (assignmentId) ? store.find("assignment", assignmentId) : undefined
            }).then(function (hash) {
                    var student = hash.user;
                    var aClass = hash.class;
                    var assignment = hash.assignment;
                    quiz.set('student', student);
                    quiz.set('class', aClass);
                    quiz.set('assignment', assignment);

                    if (!assignment || assignment.get("isMasteryLevelAssignment")){
                        if (data.chapters && data.chapters.length > 0){
                            quiz.get('chapters').then(function(chapters){
                                chapters.pushObjects(data.chapters);
                                resolve(quiz);
                            });
                        }
                        else if (data.termTaxonomies && data.termTaxonomies.length > 0){
                            quiz.get('termTaxonomies').then(function(termTaxonomies){
                                termTaxonomies.pushObjects(data.termTaxonomies);
                                resolve(quiz);
                            });
                        }
                        else{
                            resolve(quiz);
                        }
                    }
                    else{
                        resolve(quiz);
                    }
                });
        });
    },

    /*
    * Ajax call, Get Time left of the quiz
    */
    getTimeRemaining: function(_quizId){
        return new Ember.RSVP.Promise(function(resolve, reject){
            var url = Context.getBaseUrl() + "/quizzes/retrieveTimeRemaining";
            var data = { quizId: _quizId };

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
