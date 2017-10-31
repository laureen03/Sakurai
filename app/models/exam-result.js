import DS from 'ember-data';
import Ember from "ember";

export default DS.Model.extend({
    exam: DS.belongsTo('exam', { async: true }),
    completedIn: DS.attr('number'), // Time in Seconds
    completedQuestions: DS.attr('number'),
    totalQuestions: DS.attr('number'),
    correctlyAnswered: DS.attr('number'),
    answerKeys: DS.hasMany('answerKey', { async: true }),
    passedExamStatus: DS.attr("string"),

    /*
     * property {TermTaxonomyPerformances.[]} collection of performances related to the exam result
     */
    termTaxonomyPerformances: DS.hasMany('termTaxonomyPerformance', { async: true }),

    notPassed: Ember.computed('passedExamStatus', function(){
        return this.get("passedExamStatus") === 'notPassed';
    }),

    almostPassed: Ember.computed('passedExamStatus', function(){
        return this.get("passedExamStatus") === 'almostPassed';
    }),

    barelyPassed: Ember.computed('passedExamStatus', function(){
        return this.get("passedExamStatus") === 'barelyPassed';
    }),

    passed: Ember.computed('passedExamStatus', function(){
        return this.get("passedExamStatus") === 'passed';
    }),

    getTotalQuestionsInProgressAlert: Ember.computed('totalQuestions', 'completedQuestions', function(){
        var totalQuestions = this.get("totalQuestions");
        var completedQuestions = this.get("completedQuestions");
        if ((totalQuestions > 0) && (totalQuestions > completedQuestions)) {
            return completedQuestions;
        }
        return totalQuestions;
    }),

    /**
     * Resolve the exam results dependencies
     */
    resolve: Ember.computed(function(){
        return Ember.RSVP.hash({
            "exam": this.get("exam"),
            "answerKeys": this.get("answerKeys")
        });
    })

});
