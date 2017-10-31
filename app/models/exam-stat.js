import DS from 'ember-data';
import Ember from "ember";

export default DS.Model.extend({
    exams: DS.hasMany('exam', { async: true }),
    passedExamStatus: DS.attr("string"),
    completed: DS.attr("number"),
    questionsAnswered: DS.attr("number"),
    avgMLAchieved: DS.attr("number"),
    hideThresholdLabel: DS.attr('boolean'),
    minimumCustomThresholdPassing: DS.attr('number'),

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

    customThresholdPassing: Ember.computed("minimumCustomThresholdPassing", "exams", function(){
        if (this.get("minimumCustomThresholdPassing") !== null) {
            return this.get("minimumCustomThresholdPassing");
        } else {
            var exam = this.get("exams").nextObject(0);
            if (exam) {
                return exam.get("class").get("product").get("chartPassingThreshold");
            }
        }

        return null;
    })

});
