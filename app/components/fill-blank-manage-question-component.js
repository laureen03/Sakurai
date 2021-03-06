/**
 *
 * @type {FillBlankManageQuestionComponent }
 */
import Ember from "ember"; 
import ManageQuestionComponentMixin from "mixins/manage-question-component";
import Question from "models/question";
import Interaction from "objects/interaction";

export default Ember.Component.extend(
    ManageQuestionComponentMixin, {

        /**
         * @property {string}
         */
        correctResponseText: null,

        /**
         * @property {string}
         */
        unitMeasure: null,

        /**
         * @property {string}
         */
        correctResponseTextPlaceholder: I18n.t("questionLibrary.createQuestions.fillInTheBlank.correctAnswer"),

        /**
         * @property {string}
         */
        unitMeasurePlaceholder: I18n.t("questionLibrary.createQuestions.fillInTheBlank.unitMeasure"),

        /**
         * @property {bool}
         */
        correctResponseTextError: false,

        hasCalculator: false,

        updateCalculator: function() {
            var hasCalculator = this.get('hasCalculator'),
                $calculator;

            if (this.$()) {
                // Make sure the template has been rendered (the observer may fire before this happens)
                $calculator = this.$('.modal-full-question .calculator');

                if (hasCalculator) {
                    $calculator.removeClass('hidden');
                } else {
                    $calculator.addClass('hidden');
                }
            }
        },

        /**
         * will destroy for interaction
         */
        willDestroyElementInteraction: function(){
            // Destroy the calculator instance if there was one
            this.$('.modal-full-question .calculator').calculator('destroy');
        },

        /**
         * Setups the interaction during the didInsertElement
         * @see ManageQuestionComponentMixin#didInsertElement
         * @see ManageQuestionComponentMixin#didInsertElementInteraction
         */
        didInsertElementInteraction: function () {
            var self = this;

            Ember.run.scheduleOnce('afterRender', this, function() {
                self.$('.modal-full-question .calculator').calculator({
                    onClose: function(value) {
                        // Transfer the calculator value to the response input field
                        self.$('.modal-full-question #answer').val(value);
                    }
                });
                self.updateCalculator();
            });
        },

        onCalculatorChange: Ember.observer('hasCalculator', function() {
            this.updateCalculator();
        }),


        /**
         * Initializes the question interaction
         * @param {Question} question
         * @param {bool} createMode
         *
         * It is called by
         * @see ManageQuestionComponentMixin#initQuestion
         *
         * @see ManageQuestionComponentMixin#initInteraction
         */
        initInteraction: function (question, createMode) {
            var component = this;
            if (!createMode) {
                var correctResponse = question.get("correctResponse"),
                    tools = question.get('tools');

                if (correctResponse &&
                    correctResponse.value &&
                    correctResponse.value.length){
                    component.set('correctResponseText', correctResponse.value[0]);
                }

                if (tools.indexOf(Question.TOOLS.CALCULATOR) >= 0) {
                    component.set('hasCalculator', true);
                }
            }
        },

        /**
         * Validates the interaction section
         * @return {bool}
         *
         * It is called by
         * @see ManageQuestionComponentMixin#saveQuestion
         *
         * @see ManageQuestionComponentMixin#validateInteraction
         */
        validateInteraction: function(){
            // $.trim() works fine even with null and undefined
            // !! is a shortcut for getting the boolean value of the variable
            // (which will have a truthy value as long as it is a non-empty string)
            var text = $.trim(this.get("correctResponseText")),
                interactionOk = !!text;

            this.set("correctResponseTextError", !text);
            return interactionOk;
        },

        /**
         * Set all values for Interaction and return a Json
         *
         * @see ManageQuestionComponentMixin#saveQuestion
         * @see ManageQuestionComponentMixin#getInteractions
         **/
        getInteractions: function () {
            var self = this,
                unitMeasure = $.trim(this.get('unitMeasure'));

            return new Ember.RSVP.Promise( function(resolve) {

                var interaction = Interaction.create({});

                interaction.setProperties({
                    "type": Question.FILL_IN_THE_BLANK,
                    "subType": Question.FILL_IN_THE_BLANK,
                    "minChoices": 1,
                    "maxChoices": 1,
                    "shuffle": false
                });

                if (unitMeasure) {
                    interaction.set("unitMeasure", unitMeasure);
                }

                if (self.get('hasCalculator')) {
                    interaction.addTool(Question.TOOLS.CALCULATOR);
                }

                interaction.setCorrectResponse(null, [self.get("correctResponseText")], false);

                resolve( [interaction.getJson()] );
            });
        },

        resetPreviewFields: function() {
            this.$('.modal-full-question #answer').val('');

            // Reset the calculator
            this.$('.modal-full-question .calculator').calculator('option', 'value', 0);
        }
    });
