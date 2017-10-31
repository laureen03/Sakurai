import DS from 'ember-data';
import Ember from "ember";

export default DS.Model.extend({
    /**
     * @property {SakuraiWebapp.Quiz} quiz
     */
    quiz: DS.belongsTo('quiz', { async: true }),
    /**
     * @property {SakuraiWebapp.ReviewRefreshQuiz} reviewRefreshQuiz
     */
    reviewRefreshQuiz: DS.belongsTo('reviewRefreshQuiz', { async: true }),
    completedIn: DS.attr('number'), // Time in seconds
    completedQuestions: DS.attr('number'),
    totalQuestions: DS.attr('number'),
    correctlyAnswered: DS.attr('number'),
    answerKeys: DS.hasMany('answerKey', { async: true }),
    assignments: DS.hasMany('assignment', { async: true }),
    completedInFormat: Ember.computed('dueDate', function(){
        var completedIn = this.get('completedIn');
        if (completedIn <= 60){
            return "1";
        }
        else{
            return Math.round(completedIn / 60);        
        }
    })
});
