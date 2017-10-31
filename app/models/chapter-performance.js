import DS from 'ember-data';
import Ember from "ember";

export default DS.Model.extend({
    /**
     * @property Chapter
     */
    chapter: DS.belongsTo('chapter', { async: true }),
    /**
     * @property int quizzes taken in this chapter
     */
    quizzesTaken: DS.attr("number"),

    /**
     * @property int current mastery level a this chapter
     */
    currentMasteryLevel: DS.attr("number"),
    /**
     * @property int mastery level before taking the quiz
     */
    oldMasteryLevel: DS.attr("number"),

    /**
     * @property {number} current quiz id, this is related to the currentMasteryLevel
     */
    currentQuiz: DS.attr("number"),

    /**
     * @property {number} previous quiz id, this is related to the oldMasteryLevel
     */
    oldQuiz: DS.attr("number"),

    /**
     * @property int class average
     */
    classAverage: DS.attr("number"),

    /**
     * @property int indicates number of students
     */
    numStudents: DS.attr("number"),

    /**
     * @property {number} total number of questions for this chapter performance
     */
    numQuestions: DS.attr("number"),

    /**
     * @property {number} number of questions answered correctly (@see numQuestions)
     */
    numQuestionsCorrect: DS.attr("number"),

    //Return a  chapter.
    owner: Ember.computed('chapter', function(){
        return this.get("chapter");
    }),

    /**
     * @return {boolean}
     */
    hasClassAverage: Ember.computed('classAverage', function(){
        return (this.get("classAverage")!==undefined);
    }),

    /**
     * Indicates if the user had improvement in this chapter
     */
    hasImprovement: Ember.computed("currentMasteryLevel", "oldMasteryLevel", function(){
        return this.get("currentMasteryLevel") > this.get("oldMasteryLevel");
    })

});
