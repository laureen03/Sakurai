import DS from 'ember-data';
import Ember from "ember";
import TermTaxonomy from "sakurai-webapp/models/term-taxonomy";

export default DS.Model.extend({
    /**
     * @property Chapter
     */
    termTaxonomy: DS.belongsTo('termTaxonomy', { async: true }),
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
     * @property {number} total number of questions for this term taxonomy performance
     */
    numQuestions: DS.attr("number"),

    /**
     * @property {number} number of questions answered correctly (see @numQuestions)
     */
    numQuestionsCorrect: DS.attr("number"),

    /**
     * @return {boolean}
     */
    isNursingConcepts: Ember.computed('termTaxonomy', function(){
        return this.isType(TermTaxonomy.NURSING_CONCEPTS);
    }),

    /**
     * @return {boolean}
     */
    isClientNeeds: Ember.computed('termTaxonomy', function(){
        return this.isType(TermTaxonomy.CLIENT_NEEDS);
    }),

    /**
     * @return {boolean}
     */
    isType: function(type){
        return TermTaxonomy.isType(this.get("termTaxonomy"), type);
    },

     //Return a Term Taxonomy
    owner: Ember.computed('termTaxonomy', function(){
        return this.get("termTaxonomy");
    }),

    /**
     * @return {boolean}
     */
    hasClassAverage: Ember.computed('classAverage', function(){
        return (this.get("classAverage")!==undefined);
    }),

    /**
     * Resolves the dependencies
     */
    resolve: Ember.computed(function(){
        return Ember.RSVP.hash({
            "termTaxonomy": this.get("termTaxonomy")
        });
    }),

    /**
     * Indicates if the user had improvement in this taxonomy
     */
    hasImprovement: Ember.computed("currentMasteryLevel", "oldMasteryLevel", function(){
        return this.get("currentMasteryLevel") > this.get("oldMasteryLevel");
    })
});
