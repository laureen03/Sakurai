/**
 * Result class
 * A result can have a exam or quiz
 * @type {Result}
 */
import DS from 'ember-data';
import Ember from "ember";
import Result from "../models/result";

export default DS.Model.extend({

    /**
     * @property {bool} indicates if the result was correct or not, this is resolved by BE
     */
    correct: DS.attr('boolean'),

    /**
     * @property {*} the format depends of the question type, i.e single choice [1]
     */
    answer: DS.attr(),

    /**
     * @property {SakuraiWebapp.User} user
     */
    student: DS.belongsTo('user', { async: true }),

    /**
     * @property {SakuraiWebapp.Quiz} quiz
     */
    quiz: DS.belongsTo('quiz', { async: true }),

    /**
     * @property {SakuraiWebapp.Exam} exam
     */
    exam: DS.belongsTo('exam', { async: true }),

    /**
     * @property {ReviewRefreshQuiz} reviewRefreshQuiz
     */
    reviewRefreshQuiz: DS.belongsTo('reviewRefreshQuiz', { async: true }),

    /**
     * @property {SakuraiWebapp.Question} question
     */
    question: DS.belongsTo('question', { async: true }),

    /**
     * @property {Number} Current Mastery Level by Question
     **/
    masteryLevel: DS.attr('number'),
    
    /**
     * @property {bool} If the exam is auto shutoff
     **/
    examAutoShutoff: DS.attr('boolean'),

    /**
     * @property {bool} If student reached minimum performance reached
     **/
    minimumPerformanceReached: DS.attr('boolean'),

});

Result.reopenClass({
    /**
     * Creates a new result record
     * @param store
     * @param data result data
     */
    createResultRecord: function (store, data) {
        return new Ember.RSVP.Promise(function (resolve) {
            var studentId = data.student.get('id');
            var quiz = data.quiz;
            var exam = data.exam;
            var questionId = data.question.get('id');
            var isReviewRefresh = data.isReviewRefresh;
            var isQuiz = ((quiz!=null) && (!isReviewRefresh));
            var result = store.createRecord("result", {
                correct: data.correct,
                answer: data.answer
            });

            Ember.RSVP.hash(
                {
                        user : store.find("user", studentId),
                        quiz: isQuiz ? store.find("quiz", quiz.get("id")) : false,
                        exam: exam ? store.find("exam", exam.get("id")) : false,
                        reviewRefreshQuiz: isReviewRefresh ? store.find("reviewRefreshQuiz", quiz.get("id")) : false,
                        question: store.find("question", questionId)
                }).
                then(function (hash) {
                    var student = hash.user;
                    var quiz = hash.quiz;
                    var exam = hash.exam;
                    var reviewRefreshQuiz = hash.reviewRefreshQuiz;
                    var question = hash.question;

                    result.set('student', student);
                    result.set('question', question);

                    if (quiz){
                        result.set('quiz', quiz);
                    }
                    if (exam){
                        result.set('exam', exam);
                    }
                    if (reviewRefreshQuiz){
                        result.set('reviewRefreshQuiz', reviewRefreshQuiz);
                    }
                    resolve(result);
                });
        });
    }
});
