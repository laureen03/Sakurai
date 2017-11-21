//noinspection CommaExpressionJS

import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import QuestionPartialMixin from 'sakurai-webapp/mixins/question-partial';
import QuestionSet from 'sakurai-webapp/models/question-set';
import context from 'sakurai-webapp/utils/context';

export default Ember.Controller.extend(
    Ember.Evented,
    ControllerMixin,
    QuestionPartialMixin, {

    headerClasses: Ember.inject.controller(),
    library: Ember.inject.controller(),
    libraryCreateQuestionCollection: Ember.inject.controller(),

    createQuestionController: Ember.computed.alias('libraryCreateQuestionCollection'),

    /**
     * @property {Class} selected class
     */
    class: Ember.computed.alias("library.class"),

    /**
     * @property {Product} selected product
     */
    product: Ember.computed.alias("library.product"),

    /**
     * @property {Section[]} list of sections
     */
    sections: Ember.computed.alias("library.sections"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    termTaxonomies: Ember.computed.alias("library.termTaxonomies"),

    /**
     * @property {QuestionSet[]} list of all question collections the instructor has for the current product
     */
    questionSets:  Ember.computed.alias("library.questionSets"),

    /**
     * @property {QuestionSet[]} list of question collections enabled the instructor has for the current product
     */
    questionSetsEnabled:  Ember.computed.alias("library.questionSetsEnabled"),

    /**
     * @property {groupedQuestionSets[]} list of question collections enabled
     */
    groupedQuestionSets: Ember.computed.alias("library.groupedQuestionSets"),

    /**
     * @property {number} total created question for this instructor
     */
    totalCreatedQuestions: Ember.computed.alias("library.totalCreatedQuestions"),

    /**
     * Indicates if should display share QC option
     * @property {bool}
     */
    showShareQuestionCollection: Ember.computed.alias("library.showShareQuestionCollection"),

    /**
     * Indicates if should display filter by difficulty
     * @property {bool}
     */
    showFilterByDifficulty: Ember.computed.alias("library.showFilterByDifficulty"),

    /**
     * Difficulty range levels
     */
    difficultyRangeLevels: Ember.computed.alias("library.difficultyRangeLevels"),

    /**
     * @property {Ember.Object} an object with 2 properties: questionSet & questions (list of questions
     * of the questionSet). This is the source question set from which questions will be copied.
     */
    sourceQuestionSet: null,

    /**
     * @property {Ember.Object} an object with 2 properties: questionSet & questions (list of questions
     * of the questionSet). This is the target question set to which questions will be copied.
     */
    targetQuestionSet: null,

    /**
     * @property {bool} control the layout of questions (flag for question-partial.hbs)
     */
    importingQuestionSet: true,

    /**
     * @property {Boolean} active when is edit mode
     */
    questionSetEditMode: false,
    questionSetName: "",

    otherAnswersForTextEntry: Ember.ArrayProxy.create({ content: Ember.A([]) }),

    /**
     * @property {number} number of questions (from the source question set) that can be imported
     */
    numberQuestionsToImport: Ember.computed('sourceQuestionSet.questions.[]', function(){
        var questions = this.get('sourceQuestionSet.questions'),
            questionsUnableToImport = questions ? questions.filterBy('isInactive') : [];

        return questions && (questions.get('length') - questionsUnableToImport.length);
    }),

    /**
     * @property {Array} questions sorted from "retired" and "on hold" to "unassociated"
     */
    sortedQuestions: Ember.computed('sourceQuestionSet.questions.[]', function(){
        var questions = this.get('sourceQuestionSet.questions');

        // When sorting by a boolean value, false (0) comes before true (1)
        // so the array is reversed to have the inactive questions show first
        return questions && questions.sortBy('isInactive').reverse();
    }),

    /**
     * @function Edit name of question collection
     */
    editNameQC:function() {
        var controller = this;
        if ($("#edit-qc").valid()) {
            var questionSet = controller.get("sourceQuestionSet.questionSet");
            var name = controller.get("questionSetName");
            QuestionSet.fetch(questionSet)
                .then(function(questionSet){
                    questionSet.set("mode", "info");
                    questionSet.set("name", name);
                    questionSet.save().then(function(){
                        controller.set("questionSetEditMode", false);
                    });
            });
        }
    },

    returnToQuestionCollection: function () {
        var self = this;
        this.transitionToRoute('library.results', self.get('class.id'),
            { queryParams: { qsId: self.get('targetQuestionSet.questionSet.id') }});
    },

    actions:{
        activeQCEdit: function(){
            this.set("questionSetEditMode", true);
            this.set("questionSetName", this.get("questionSet.name"));
        },

        editQL: function(){
            this.editNameQC();
        },

        searchByInstructor: function(){
            var authenticationManager = context.get("authenticationManager");
            var userId = authenticationManager.getCurrentUserId();
            var paramName = authenticationManager.getCurrentUser().get("isAdmin")? "authorIds" : "instructorId";
            this.transitionToRoute("/instructor/library/results/" + this.get("class.id") + "?" + paramName + "=" + userId);
        },

        searchByQuestionSet: function(id){
            var classId = this.get("class.id");
            this.transitionToRoute("/instructor/library/results/" + classId + "?qsId=" + id);
        },

        showMoreAnswers: function(otherAnswers, showClassPercentages) {
            var otherAnswersForTextEntry = this.get('otherAnswersForTextEntry'),
                otherAnswersModal = $('#text-entry-modal');

            // Update data before showing the modal
            otherAnswersForTextEntry.clear();
            otherAnswersForTextEntry.pushObjects(otherAnswers);

            // Show the modal with the updated data
            if (showClassPercentages) {
                otherAnswersModal.addClass('class-percentages');
            } else {
                otherAnswersModal.removeClass('class-percentages');
            }
            otherAnswersModal.modal('show');
        },

        removeQuestion: function(id) {
            var questions = this.get('sourceQuestionSet.questions'),
                question;

            question = questions.find( function(question) {
                return question.get('id') === id;
            });
            questions.removeObject(question);
        },

        importQuestions: function() {

            var self = this,
                targetQuestionSet = this.get('targetQuestionSet.questionSet');

            Ember.RSVP.hash({
                product: targetQuestionSet.get('product'),
                user: targetQuestionSet.get('user'),
                questions: targetQuestionSet.get('questions')
            }).then( function( hash ) {

                var targetQuestions = hash.questions,
                    questionsToCopy = self.get('sourceQuestionSet.questions').filter( function(question) {

                    // Filter out inactive questions
                    return !(question.get('isInactive'));

                }).filter( function(question) {

                    // Filter out questions that already exist in the target
                    return targetQuestions.indexOf(question) === -1;

                });

                if (questionsToCopy.length) {
                    // Add the remaining questions to the questions in the target question set
                    targetQuestions.pushObjects(questionsToCopy);

                    targetQuestionSet.set('mode', 'questions');
                    targetQuestionSet.set('user', hash.user);
                    targetQuestionSet.set('product', hash.product);

                    // Save the question set and return to the target question set
                    targetQuestionSet.save().then( function() {
                        self.returnToQuestionCollection();
                    }, function(reason) {
                        self.send('error', { reason: reason });
                        self.returnToQuestionCollection();
                    });

                } else {
                    self.returnToQuestionCollection();
                }

            });
        },
    }

});
