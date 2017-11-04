/**
 *
 * @type {SakuraiWebapp.DragAndDropQuestionComponent}
 */
SakuraiWebapp.DragAndDropQuestionComponent = Ember.Component.extend(
    SakuraiWebapp.ManageQuestionComponentMixin,
    {

    /**
     * @property {[]} question answer choices
     */
    answerChoices: null,

    /**
     * @property {number} max answer choices in question
     */
    maxAnswerChoices: 6,

    /**
     * @property {Boolean} Show error for answer choice
     */
    answerChoiceInvalid: false,

    /**
     * will destroy for interaction
     */
    willDestroyElementInteraction: function(){
        // Remove event listener from answer choices button
        $('.interaction .btn-default').off('click');
    },


    /**
     * Setups the interaction during the didInsertElement
     * @see SakuraiWebapp.ManageQuestionComponentMixin#didInsertElement
     * @see SakuraiWebapp.ManageQuestionComponentMixin#didInsertElementInteraction
     */
    didInsertElementInteraction: function () {
        this.$( ".question-container-dragn-drop" ).sortable();
        this.$( ".question-container-dragn-drop" ).disableSelection();
    },

    /**
     * Initializes the question interaction
     * @param {SakuraiWebapp.Question} question
     * @param {bool} createMode
     *
     * It is called by
     * @see SakuraiWebapp.ManageQuestionComponentMixin#initQuestion
     *
     * @see SakuraiWebapp.ManageQuestionComponentMixin#initInteraction
     */
    initInteraction: function (question, createMode) {
        var component = this,
            answerChoice = {
                id: 0,
                text: '',
                fixed: false
            },
            maxAnswerChoices = component.get('maxAnswerChoices'),
            interaction, emptyAnswerChoice, answerChoices, choicesLen, correctResponses;

        if (createMode) {
            component.set('answerChoices', Ember.ArrayProxy.create({ content: Ember.A() }));
            answerChoices = component.get('answerChoices');

            // Fill up the rest of the distractors with empty objects
            for (choicesLen = 0; choicesLen < maxAnswerChoices; ++choicesLen) {
                emptyAnswerChoice = $.extend({}, answerChoice, { id: choicesLen });
                answerChoices.pushObject(emptyAnswerChoice);
            }
        }
        else {
            interaction = question.get('interactions').objectAt(0);
            component.set('answerChoices', interaction.answerChoices);

            answerChoices = this.get('answerChoices');
            correctResponses = interaction.correctResponse.value;

            answerChoices.forEach( function(answerChoice) {
                if (~correctResponses.indexOf(answerChoice.id)) {
                    // Add the property correct so it's easier to manage the
                    // correct answers through the checkboes
                    answerChoice.correct = true;
                }
            });

            choicesLen = answerChoices.get('length');

            // Fill up the rest of the distractors with empty objects
            for (; choicesLen < maxAnswerChoices; ++choicesLen) {
                emptyAnswerChoice = $.extend({}, answerChoice, { id: choicesLen });
                answerChoices.pushObject(emptyAnswerChoice);
            }
        }
    },

    /**
     * Validates the interaction section
     * @return {bool}
     *
     * It is called by
     * @see SakuraiWebapp.ManageQuestionComponentMixin#saveQuestion
     *
     * @see SakuraiWebapp.ManageQuestionComponentMixin#validateInteraction
     */
    validateInteraction: function(){
        return !this.get("answerChoiceInvalid");
    },

    /**
     * Set all values for Interaction and return a Json
     *
     * @see SakuraiWebapp.ManageQuestionComponentMixin#saveQuestion
     * @see SakuraiWebapp.ManageQuestionComponentMixin#getInteractions
     **/
    getInteractions: function () {
        var self = this;
        return new Em.RSVP.Promise( function(resolve, reject) {

            var interaction = SakuraiWebapp.Interaction.create({}),
                fixedAnswerCount = 0,
                answerChoices = self.get('answerChoices'),
                maxAnswerChoices = self.get('maxAnswerChoices'),
                answerChoiceInvalid = true,
                answerChoice, fixed, text, correctId, correctAnswerChoices=[];
            
            interaction.setProperties({
                "type": SakuraiWebapp.Question.DRAG_AND_DROP,
                "subType": SakuraiWebapp.Question.DRAG_AND_DROP,
                "minChoices": answerChoices.get("length"),
                "maxChoices": answerChoices.get("length") });

            for (var i = 0; i < maxAnswerChoices; i++) {
                answerChoice = answerChoices.objectAt(i);
                text = answerChoice.text.trim();

                if (text) {
                    // Only accept the distractor if its text is not empty

                    fixed = answerChoice.fixed;
                    correctId = +(answerChoice.id);  // cast to integer

                    interaction.addAnswerChoice(correctId, text, null, null, fixed, i);

                    if (fixed) {
                        fixedAnswerCount = fixedAnswerCount + 1;
                    }
                    correctAnswerChoices.pushObject(correctId);
                }
            }

            if (correctAnswerChoices.length > 2) {
                answerChoiceInvalid = false;
                interaction.setCorrectResponse(null, correctAnswerChoices, false);
            }

            // if all answer choices are fixed the shuffle is false
            if (fixedAnswerCount == interaction.get('expectedLength')) {
                interaction.set("shuffle", false);
            }

            self.set("answerChoiceInvalid", answerChoiceInvalid);
            
            // Resolve the promise with a json object for the interactions
            resolve( [interaction.getJson()] );
        });
    }
});
