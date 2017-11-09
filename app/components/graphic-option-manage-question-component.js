/**
 *
 * @type {GraphicOptionManageQuestionComponent}
 */
import Ember from "ember"; 
import ManageQuestionComponentMixin from "mixins/manage-question-component";
import Question from "models/question";
import Interaction from "objects/interaction";

export default Ember.Component.extend(
    ManageQuestionComponentMixin, {

    /**
     * @property {[]} question answer choices
     */
    answerChoices: null,

    /**
     * @property {number} max answer choices in question
     */
    maxAnswerChoices: 12,

    /**
     * @property {String} Correct Response index with radio Buttons
     */
    correctResponseVal: -1,

    /**
     * @property {Boolean} Show error for answer choice
     */
    answerChoiceInvalid: false,

    /**
     * @property {Boolean} Have all the answer choice images been saved successfully?
     */
    imagesSaved: true,

    /**
     * will destroy for interaction
     */
    willDestroyElementInteraction: function(){
        // Remove event listener from 'add distractor' button
        $('.interaction .btn-default').off('click');
    },

    /**
     * Setups the interaction during the didInsertElement
     * @see ManageQuestionComponentMixin#didInsertElement
     * @see ManageQuestionComponentMixin#didInsertElementInteraction
     */
    didInsertElementInteraction: function () {
        var numHiddenDistractors = 7,
            maxAnswerChoices = this.get('maxAnswerChoices'),
            distractorIndex = maxAnswerChoices - numHiddenDistractors,
            $distractors = $('.interaction .answer-choice'),
            $distractorBtn = $('.interaction .add-distractor'),
            hideRemainingDistractors = false,
            $distractor;

        for (; distractorIndex < maxAnswerChoices; distractorIndex++) {
            $distractor = $distractors.eq(distractorIndex);

            if (hideRemainingDistractors) {
                $distractor.addClass('hidden');
                continue;
            }

            if (!$distractor.find('input[type="file"]').prop('files').length) {

                // Add event listener for distractor button
                $distractorBtn.on('click', this, function (e) {
                    var view = e.data,
                        $distractors = view.$('.interaction .answer-choice.hidden');

                    e.preventDefault();

                    if ($distractors.length === 1) {
                        // There's only one distractor left hidden so after showing this distractor,
                        // hide the 'add distractor' button
                        $distractors.eq(0).removeClass('hidden');
                        $(this).addClass('hidden');
                    } else {
                        $distractors.eq(0).removeClass('hidden');
                    }
                });

                $distractor.addClass('hidden');
                $distractorBtn.removeClass('hidden');
                hideRemainingDistractors = true;
            }
        }
    },


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
        var answerChoice = {
                id: 0,
                image: null,
                fixed: false
            },
            maxAnswerChoices = this.get('maxAnswerChoices'),
            interaction, emptyAnswerChoice, answerChoices, choicesLen;

        if (createMode) {
            this.set('answerChoices', Ember.A());
            answerChoices = this.get('answerChoices');

            // Fill up the rest of the distractors with empty objects
            for (choicesLen = 0; choicesLen < maxAnswerChoices; ++choicesLen) {
                emptyAnswerChoice = $.extend({}, answerChoice, { id: choicesLen });
                answerChoices.pushObject(emptyAnswerChoice);
            }
        }
        else {
            interaction = question.get('interactions').objectAt(0);

            // Map images to the structure used by the file-upload component
            answerChoices = interaction.answerChoices.map( function(answerChoice) {
                var slashIdx = answerChoice.media.lastIndexOf('/');
                return {
                    id: answerChoice.id,
                    fixed: answerChoice.fixed,
                    image: {
                        relativePath: answerChoice.media,
                        fileName: answerChoice.media.substring(slashIdx + 1),
                        mediaType: answerChoice.mediaType
                    }
                };
            });

            this.set('answerChoices', answerChoices);
            this.set('correctResponseVal', interaction.correctResponse.value[0]);

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
     * @see ManageQuestionComponentMixin#saveQuestion
     *
     * @see ManageQuestionComponentMixin#validateInteraction
     */
    validateInteraction: function(){
        return !this.get("answerChoiceInvalid") && this.get('imagesSaved');
    },

    /**
     * Set all values for Interaction and return a Json
     *
     * @see ManageQuestionComponentMixin#saveQuestion
     * @see ManageQuestionComponentMixin#getInteractions
     **/
    getInteractions: function (isPreview) {
        var self = this;

        return new Ember.RSVP.Promise( function(resolve, reject) {
            var interaction = Interaction.create({}),
                fixedAnswerCount = 0,
                answerChoices = self.get('answerChoices'),
                correctResponse = +(self.get('correctResponseVal')),
                maxAnswerChoices = self.get('maxAnswerChoices'),
                answerChoiceInvalid = true,
                imagePromises = [],
                answerChoice, fixed, image, correctId;

            // Assume that all images will be saved without problems
            self.set('imagesSaved', true);

            interaction.setProperties({
                "type": Question.CHOICE,
                "subType": Question.GRAPHIC_OPTION,
                "minChoices": 1,
                "maxChoices": 1 });

            for (var i = 0; i < maxAnswerChoices; i++) {
                answerChoice = answerChoices.objectAt(i);
                image = answerChoice.image;

                if (image && image.relativePath) {
                    // Only accept the answer choice if it has an image

                    fixed = answerChoice.fixed;
                    correctId = +(answerChoice.id);  // cast to integer

                    // If image.content === true, this means an image was uploaded via the file-upload
                    // component. Otherwise, this is a previously saved image that doesn't need to be saved again
                    if (image.content) {
                        if (isPreview) {
                            // For preview, use image.content to render the image and not upload it to the server
                            interaction.addAnswerChoice(correctId, '', answerChoice.image.content, answerChoice.image.mediaType, fixed, i);
                        } else {
                            // Only save the image if the question is being saved.
                            imagePromises.push(self.saveImage(interaction, i, correctId, fixed, answerChoice));
                        }
                    } else {
                        if (isPreview) {
                            interaction.addAnswerChoice(correctId, '', answerChoice.image.relativePath, answerChoice.image.mediaType, fixed, i);
                        } else {
                            interaction.addAnswerChoice(correctId, '', answerChoice.image.fileName, answerChoice.image.mediaType, fixed, i);
                        }
                    }

                    if (fixed) {
                        fixedAnswerCount = fixedAnswerCount + 1;
                    }
                    if (correctId === correctResponse) {
                        answerChoiceInvalid = false;
                        interaction.setCorrectResponse(null, [correctId], false);
                    }
                }
            }

            // if all answer choices are fixed, the shuffle is false
            if (fixedAnswerCount === interaction.get('expectedLength')) {
                interaction.set("shuffle", false);
            }

            self.set("answerChoiceInvalid", answerChoiceInvalid);

            // Resolve the promise with a json object for the interactions
            Ember.RSVP.all(imagePromises).then( function() {
                if (self.get('imagesSaved')) {
                    resolve([interaction.getJson()]);
                } else {
                    reject(I18n.t('error.unableToSaveImage.other'));
                }
            });
        });
    },

    saveImage: function(interaction, i, correctId, fixed, answerChoice) {
        var self = this,
            imageObj = answerChoice.image;

        return this.get("data-store")
            .createRecord("questionMedium", imageObj)
            .save().then(function (savedImageRecord) {
                return interaction.addAnswerChoice(correctId, '', savedImageRecord.get('relativePath'), savedImageRecord.get('mediaType'), fixed, i);
            }, function (reason) {
                // Clear data for the image
                answerChoice.image = null;
                // Update the information for the answer choice
                self.get('answerChoices').replace(i, 1, [answerChoice]);
                self.set('imagesSaved', false);
                toastr.error(I18n.t('error.unableToSaveImage.one') + ': ' + reason.statusText);
            });
    }

});
