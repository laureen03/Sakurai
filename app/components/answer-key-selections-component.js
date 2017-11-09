import Ember from "ember"; 
import Question from "models/question";
import QuestionHelper from "utils/question-helper";

export default Ember.Component.extend({
	/**
     * Create an array with the list of selection
     * @return Array
     */
    selections: Ember.computed(function(){ 
	    var helper = QuestionHelper.create({});
        var result = this.get('result');
        var interaction = this.get('interaction');
        var selections = [];
        if (interaction.type === Question.CHOICE){
        	$.each(result.get('answer'), function(index, answerChoiceId){
	        	var answerChoice = helper.getAnswerChoice(answerChoiceId, interaction);
				selections.push({"correct": helper.isAnswerChoiceCorrect(answerChoice, interaction), "answerChoice": answerChoice});
	        });
        }else{
            $.each(result.get('answer'), function(index, answerChoiceId){
                var answerChoice = helper.getAnswerChoice(answerChoiceId, interaction);
                selections.push({"correct": helper.isAnswerChoiceCorrectOrder(index, answerChoiceId, interaction), "answerChoice": answerChoice});
            });
        }

        return selections;
    }),

    /**
     * Create an array with the list of Correct Responds
     * @return Array
     */
    correctResponses: Ember.computed(function(){ 
        var helper = QuestionHelper.create({});
        return helper.getCorrectResponses(this.get("interaction"));
    })


});