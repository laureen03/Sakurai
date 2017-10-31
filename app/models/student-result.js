import DS from 'ember-data';
import Ember from "ember";

export default DS.Model.extend({
    user: DS.belongsTo('user', { async: true }),
    numQuizzes: DS.attr("number"),
    numQuizzesTotal: DS.attr("number"),
    masteryLevel: DS.attr("number"),
    minToComplete: DS.attr("number"),
    status: DS.attr("string"),
    questionsAnswered: DS.attr("number"),
    questionsAnsweredTotal: DS.attr("number"),
    questionsCorrect: DS.attr("number"),
    answerKeyViews: DS.attr("number"),
    remediationViews: DS.attr("number"),

    /**
     * Date for the first time ever the user signed in
     * @property {date}
     */
    startDate: DS.attr('date'),

    /**
     * score {number} number of points from the assignment that the student gained
     */
    score: DS.attr("number"),

    /**
     * scorePercentage {number} percentage of points gained by the student
     */
    scorePercentage: DS.attr("number"),

    lastQuestionSubmittedTime: DS.attr("date"),

    /**
     * Indicates when the assignment is completed
     */
    isComplete: Ember.computed('status', function(){
        return this.get("status") === "completed";
    }),

    /**
     * Indicates when the assignment is not completed
     */
    isInCompleted: Ember.computed('status', function(){
        var studentStatus = this.get("status");
        return studentStatus && studentStatus === "notCompleted";
    }),

    /**
     * Indicates when the assignment is pastDue
     */
    isPastDue: Ember.computed('status', function(){
        return this.get("status") === "pastDue";
    }),

    isAutoCompleted: Ember.computed('status', function(){
        return this.get("status") === "autoCompleted";
    }),
    
    isAutoShutoff: Ember.computed('status', function(){
        return this.get("status") === "autoShutoff";
    }),

    timeToComplete: Ember.computed('minToComplete', function(){
        var time = "";
        var minutes = this.get("minToComplete");
        if (minutes === 0){
            time = "0m";
        }
        else{
            var numDays = Math.floor(minutes / 1440);
            var numHours = Math.floor((minutes % 1440) / 60);
            var numMinutes = (minutes % 1440) % 60;

            time += (numDays !== 0) ? numDays + "d " : "";
            time += (numHours !== 0) ? numHours + "h " : "";
            time += (numMinutes !== 0) ? numMinutes + "m " : "";
        }
        return time;

    })

});
