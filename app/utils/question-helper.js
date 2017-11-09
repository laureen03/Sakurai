import Ember from 'ember';

export default Ember.Object.extend({

    /**
     * Create an array with the list of Correct Responds
     * @return Array
     */
    getCorrectResponses: function(interaction){
        var helper = this;
        var correctResponses = [];

        var correctAnswerChoices = helper.getCorrectAnswerChoices(interaction);
        $.each(correctAnswerChoices, function(index, answerChoiceId){
            var answerChoice = helper.getAnswerChoice(answerChoiceId, interaction);
            correctResponses.push({"answerChoice": answerChoice});
        });

        return correctResponses;
    },

    /**
     * Gets the answer choices ids
     * @param {*} interaction
     * @return {array} answer choices ids
     */
    getCorrectAnswerChoices : function(interaction){
        return (interaction.correctResponse) ?
            interaction.correctResponse.value : [];
    },


    /**
     * Indicates whether or not an answer choice is in the correct order
     * @param {number} index
     * @param {number} idResult
     * @param {*} interaction
     * @return bool
     */
    isAnswerChoiceCorrectOrder: function(index, idResult, interaction){
        var correctAnswerChoices = this.getCorrectAnswerChoices(interaction);
        return idResult === correctAnswerChoices[index];
    },

    /**
     * Indicates whether or not an answer choice is correct
     * @param {*} answerChoice answer choice data
     * @param {*} interaction interaction data
     * @return bool
     */
    isAnswerChoiceCorrect: function(answerChoice, interaction){
        var correctAnswerChoices = this.getCorrectAnswerChoices(interaction);
        if (answerChoice){
            return correctAnswerChoices.contains(answerChoice.id);
        }
    },

    /**
     * Gets an answer choice by id
     * @param {int} answerChoiceId
     * @param {*} interaction interaction data
     * @return {*} answer choice data
     */
    getAnswerChoice: function(answerChoiceId, interaction){
        var answerChoices = interaction.answerChoices;
        var found = null;
        $.each(answerChoices, function(index, answerChoice){
            if (answerChoice.id === answerChoiceId){
                found = answerChoice;
            }
        });

        return found;
    },

    /**
     * Gets the answer choice percentage by id
     * @param {number} answerChoiceId
     * @param {*} answerChoicesPercentages
     * @return number
     */
    getAnswerChoicePercentage: function(answerChoiceId, answerChoicesPercentages){
        var percentage = 0;
        $.each(answerChoicesPercentages, function(index, percentages){
            if( $.inArray(answerChoiceId, percentages.answerChoiceIds) !== -1){
                percentage = percentages.answerPercentage;
            }
        });

        return percentage;
    },

    /**
     * Compare if Drag and drop array is same as correct response array
     * @param {array} answerChoiceIds
     * @param {array} correctAnswerChoiceIds
     * @return {bool}
     */
    isAnswerDragAndDropCorrect: function(answerChoiceIds, correctAnswerChoiceIds){
        return JSON.stringify(answerChoiceIds) === JSON.stringify(correctAnswerChoiceIds);
    },

    /**
     * Gets the class answer choice percentage by id
     * @param {number} answerChoiceId
     * @param {*} classAnswerChoice
     * @return number
     */
    getClassAnswerChoicePercentage: function(answerChoiceId, classAnswerChoice){
        var percentage = 0;
        $.each(classAnswerChoice, function(index, clazzAnswerChoicesPercentages){
            if( $.inArray(answerChoiceId, clazzAnswerChoicesPercentages.answerChoiceIds) !== -1){
                percentage = clazzAnswerChoicesPercentages.answerPercentage;
            }
        });

        return percentage;
    }

});
