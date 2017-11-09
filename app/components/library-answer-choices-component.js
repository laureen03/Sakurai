import Ember from "ember"; 
import QuestionHelper from "utils/question-helper";
import Question from "models/question";

export default Ember.Component.extend({
    /**
     * Return answer choices
     * @return Array
     */
    answerChoices: Ember.computed(function(){    
        var helper = QuestionHelper.create({});
        var component = this,
            interaction = this.get('interaction'),
            answerChoicesPercentages = interaction.answerChoicesPercentages,
            classAnswerChoicesPercentages = interaction.classAnswerChoicesPercentages,
            answerChoices = [],
            isCorrectAnswerFound = false,
            otherPercentage = 100,
            otherClassPercentage = 100,
            otherAnswer = {},
            othersAnswers = [],
            hasClassPercentages = this.get('has-class-percentages'),
            mergedAnswerChoices;
        if (interaction.type === Question.CHOICE) {
            mergedAnswerChoices = [];
            $.each(interaction.answerChoices, function(index, answerChoice){
                
                if (answerChoice.answerPercentage === undefined){
                    answerChoice.answerPercentage = helper.getAnswerChoicePercentage(answerChoice.id, answerChoicesPercentages);
                }

                var answerChoicesObj = {};
                answerChoicesObj.correct = helper.isAnswerChoiceCorrect(answerChoice, interaction);
                answerChoicesObj.answerChoice = answerChoice;

                if (hasClassPercentages) {
                    answerChoicesObj.classPercentage = helper.getClassAnswerChoicePercentage(answerChoice.id,interaction.classAnswerChoicesPercentages);
                    answerChoicesObj.classIsCorrect = answerChoicesObj.correct;

                    if (answerChoicesObj.correct) {
                        // Push the character that corresponds to the answer choice
                        mergedAnswerChoices.push(String.fromCharCode(65 + index));
                    }
                }

                answerChoices.push(answerChoicesObj);
            });
            if (interaction.subType === Question.CHOICE_MULTIPLE) {

                if (hasClassPercentages) {
                    // If this a 'choice_multiple' question, the first answer choice will be the correct aggregate choice
                    answerChoices.unshift({
                        correct: true,
                        answerChoice: {
                            text: 'Correct : ' + mergedAnswerChoices.join(', '),
                            answerPercentage: interaction.questionPercentage.correctPercentage
                        },
                        classPercentage: interaction.classQuestionPercentage.correctPercentage,
                        classIsCorrect: true
                    });
                }
            }
        }
        else if(interaction.type === Question.DRAG_AND_DROP){
            var answerChoicesArr = [];
            $.each(interaction.answerChoicesPercentages, function(index, answerChoice){

                var answerChoicesObj = {},
                    intAnswerChoices = interaction.answerChoices,
                    correctArr = [];

                $.each(answerChoice.answerChoiceIds, function(idx, id){

                    $.each(intAnswerChoices,function(index,ansChoices){
                        if(id ===  ansChoices.id){
                            correctArr.push (index);
                        }
                    });
                });

                if (answerChoice.text === undefined){
                    answerChoice.text = component.parseToString(correctArr);
                }
                
                answerChoicesArr.push(answerChoice.text);
                
                var correctAnswerChoices = helper.getCorrectAnswerChoices(interaction);

                answerChoicesObj.correct = helper.isAnswerDragAndDropCorrect(answerChoice.answerChoiceIds, correctAnswerChoices);
                answerChoicesObj.answerChoice = answerChoice;

                if (hasClassPercentages) {
                    $.each(interaction.classAnswerChoicesPercentages, function(classAnswerChoice){
                        if(helper.isAnswerDragAndDropCorrect(answerChoice.answerChoiceIds, classAnswerChoice.answerChoiceIds)) {
                            answerChoicesObj.classPercentage = classAnswerChoice.answerPercentage;                            
                        }                            
                    });
                    if(answerChoicesObj.classPercentage === undefined) {
                        answerChoicesObj.classPercentage = 0;
                    }
                    answerChoicesObj.classIsCorrect = answerChoicesObj.correct;
                }
                answerChoices.push(answerChoicesObj);
            });
            if (hasClassPercentages) {
                $.each(interaction.classAnswerChoicesPercentages, function(index, answerChoice){
                    var answerChoicesObj = {},
                        intAnswerChoices = interaction.answerChoices,
                        correctArr = [];
                    $.each(answerChoice.answerChoiceIds, function(idx, id){

                        $.each(intAnswerChoices,function(index,ansChoices){
                            if(id ===  ansChoices.id){
                                correctArr.push (index);
                            }
                        });
                    });

                    if (answerChoice.text === undefined){
                        answerChoice.text = component.parseToString(correctArr);
                    }

                    if(answerChoicesArr.indexOf(answerChoice.text) === -1) {
                        answerChoicesObj.classPercentage = answerChoice.answerPercentage;
                        answerChoice.answerPercentage = 0;
                        var correctAnswerChoices = helper.getCorrectAnswerChoices(interaction);

                        answerChoicesObj.correct = helper.isAnswerDragAndDropCorrect(answerChoice.answerChoiceIds, correctAnswerChoices);
                        answerChoicesObj.answerChoice = answerChoice;
                        
                        answerChoicesObj.classIsCorrect = answerChoicesObj.correct;

                        answerChoices.push(answerChoicesObj);
                    }                
                });
            }
        }
        else if(interaction.type === Question.HOT_SPOT){

            $.each(interaction.answerChoices, function(index, answerChoice){
                if (answerChoice.answerPercentage === undefined){
                    answerChoice.answerPercentage = 0;
                }
                answerChoices.push({
                    "correct": helper.isAnswerChoiceCorrect(answerChoice, interaction),
                    "answerChoice": answerChoice
                });
            });

        }
        else if (interaction.type === Question.FILL_IN_THE_BLANK) {

            // Merge the information into one single array for easier manipulation
            mergedAnswerChoices = component.mergeAnswerChoices('textEntryValue', answerChoicesPercentages, classAnswerChoicesPercentages);

            if (mergedAnswerChoices.length < 5) {

                // If there are less than 5 answers, load the information
                // for each answer and show them
                $.each(mergedAnswerChoices, function(index, object) {
                    component.loadAnswer(answerChoices, object);
                });
            } else {

                $.each(mergedAnswerChoices, function(index, object) {
                    var isCorrectAnswerLoaded;

                    if (index < 3) {
                        // load the information for the first 3 answers.
                        otherPercentage -= object.answerPercentage;
                        otherClassPercentage -= object.classAnswerPercentage;
                        isCorrectAnswerLoaded = component.loadAnswer(answerChoices, object);

                        // override the value only if we haven't found it
                        isCorrectAnswerFound = isCorrectAnswerFound || isCorrectAnswerLoaded;
                    } else if (index === 3) {
                        if (isCorrectAnswerFound) {
                            // If the correct answers is within the first 3 answers, then
                            // load another answer in answerChoices
                            otherPercentage -= object.answerPercentage;
                            otherClassPercentage -= object.classAnswerPercentage;
                            component.loadAnswer(answerChoices, object);
                        } else {
                            // If not, put the current answer in the otherAnswers array and
                            // continue looking for the correct answer -load it as the
                            // fourth answer when it's found.
                            component.loadAnswer(othersAnswers, object);
                        }
                    } else {
                        if (object.correct) {
                            otherPercentage -= object.answerPercentage;
                            otherClassPercentage -= object.classAnswerPercentage;
                            component.loadAnswer(answerChoices, object);
                        } else {
                            component.loadAnswer(othersAnswers, object);
                        }
                    }
                });

                // The fifth answer will be the "All other answers" link
                otherAnswer.correct = false;
                otherAnswer.answerChoice = {
                    link: I18n.t('questionLibrary.otherAnswers'),
                    answerPercentage: otherPercentage,
                    otherAnswers: othersAnswers
                };
                otherAnswer.classPercentage = otherClassPercentage;
                answerChoices.push(otherAnswer);
            }

        } else{

            $.each(interaction.answerChoices, function(index, answerChoice){
                if (answerChoice.answerPercentage === undefined){
                    answerChoice.answerPercentage = helper.getAnswerChoicePercentage(answerChoice.id, answerChoicesPercentages);
                }
                answerChoices.push({
                    "correct": helper.isAnswerChoiceCorrectOrder(index, answerChoice.id, interaction),
                    "answerChoice": answerChoice
                });
            });
        }
        return answerChoices;
    }),

    /**
     * @property check if qc type is drag and drop in component scope
     * @return bool
     */
    dragNdop: Ember.computed(function(){  
        var interaction = this.get('interaction');
        return interaction.type === Question.DRAG_AND_DROP;
    }),

    /**
     * @property return a list of all choices in question only for d & d questions
     * @returns Array
     */
    questionChoices: Ember.computed(function(){ 
        var interaction = this.get('interaction');
        var choices = [];
        $.each(interaction.answerChoices, function(index, answerChoice){
            choices.push(
                String.fromCharCode(65+index).toLowerCase()+'. '+answerChoice.text
            );
        });
        return choices;
    }),

    /**
     * Merge the class percentage information into one single array for easier manipulation
     * @param mergeKey {string} name of the key used to merge both arrays
     * @param allArray {array}
     * @param classArray {array}
     * @return array with all the information used for output in the template
     */
    mergeAnswerChoices: function(mergeKey, allArray, classArray) {
        var merged;

        if (!classArray || !classArray.length) {
            merged = allArray;
        } else {
            merged = [];
            allArray.forEach( function(item) {
                // The value of item[mergeKey] is expected to be an array
                var mergeValue = item[mergeKey].toString(),
                    arrayLen = classArray.length,
                    found = false,
                    i;

                for (i = 0; i < arrayLen; i++) {
                    if (classArray[i][mergeKey].toString() === mergeValue) {
                        item.classAnswerPercentage = classArray[i].answerPercentage;
                        merged.push(item);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    Ember.Logger.warn('No class percentage match found for item with mergeKey (' + mergeKey + ') value: ' + item[mergeKey]);
                }
            });
        }
        return merged;
    },

    /**
     * Load information from the answerObject into the resultArray
     * @param answerObject {object}
     * @param resultArray {array}
     * @return bool whether the loaded answer was the correct answer or not
     */
    loadAnswer: function(resultArray, answerObject) {
        if (answerObject.hasOwnProperty('classAnswerPercentage')) {
            resultArray.push({
                "correct": answerObject.correct,
                "answerChoice": {
                    "text": answerObject.textEntryValue.pop(),
                    "answerPercentage": answerObject.answerPercentage
                },
                "classPercentage": answerObject.classAnswerPercentage,
                "classIsCorrect": answerObject.correct
            });
        } else {
            resultArray.push({
                "correct": answerObject.correct,
                "answerChoice": {
                    "text": answerObject.textEntryValue.pop(),
                    "answerPercentage": answerObject.answerPercentage
                }
            });
        }
        return answerObject.correct;
    },

    /**
    * Parse an array and returns it in the expected format
    * @params array
    * @return string
    */
    parseToString: function(arr){

        var str = '';
        for(var i = 0; i < arr.length; i++){
            str +=  (i+1) + String.fromCharCode(65+arr[i]) + ', ';
        }
        return str.toLowerCase().substring(0, str.length - 2);
    },

    actions: {
        showMoreAnswers: function(otherAnswers, showClassPercentages) {
            this.sendAction('action', otherAnswers, showClassPercentages);
        }
    }

});
