import Ember from 'ember';
import context from 'sakurai-webapp/utils/context';
import LearningObjective from 'sakurai-webapp/models/learning-objective';

/**
 *
 * Manage question mixin used for creating/editing questions
 *
 * @type {SakuraiWebapp.ManageQuestionComponentMixin}
 */

export default Ember.Mixin.create({
    /**
     * @property learning objectives
     */
    'data-learning-objectives': null,

    /**
     * @property question products
     */
    'data-products': null,

    /**
     * @property ember store
     */
    'data-store': null,

    /**
     * @property taxonomies allowed for tagging
     */
    'data-tagging-term-taxonomies': null,

    /**
     * @property {SakuraiWebapp.Question} Question Information
     */
    'data-question': null,

    /**
     * @property {SakuraiWebapp.Class} selected class
     */
    'data-class': null,

    /**
     * All product term taxonomies
     * @property {SakuraiWebapp.TermTaxonomy[]}
     */
    'data-term-taxonomies': null,

    /**
     * @property {bool} is this question about to be edited/created by an admin
     */
    'data-is-admin': true,

    /**
     * @property {bool} is a question being created (if not, it's being edited)
     */
    'data-create-mode': true,

    /**
     * Indicates when is creating a question variant
     * @property {bool}
     */
    'data-create-variant': false,

    /**
     * @property {string} save question action
     */
    'data-save-action' : "saveQuestion",

    /**
     * @property {string} save question action
     */
    'data-cancel-action' : "cancelChanges",

    /**
     * Indicates if it is on edit mode
     * @property {bool}
     */
    isEditing: Ember.computed.not('data-create-mode'),

    /**
     * @property {Object} information for the question image
     * @see SakuraiWebapp.FileUploadComponent#file-information
     */
    questionImage: null,

    /**
     * @property {bool} is this a minor edit for the question?
     */
    isMinorEdit: true,

    /**
     * @property {String} PlaceHolder of question Text
     */
    placeHolder: I18n.t('questionLibrary.createQuestions.typeQuestionHere'),

    /**
     * List of all the selected term taxonomies
     * @property {SakuraiWebapp.TermTaxonomy[]}
     */
    selectedTermTaxonomies: Ember.A(),


    /**
     * List of all the selected learning objectives
     * @property {SakuraiWebapp.LearningObjective[]}
     */
    selectedLearningObjectives: Ember.A(),

    /**
     * List of all the selected subjects
     * @property {SakuraiWebapp.Subject[]}
     */
    selectedSubjects: Ember.A(),



    /**
     * List of all the selected Remediation Links
     * @property {SakuraiWebapp.RemediationLink[]}
     */
    selectedRemediationLinks: Ember.A(),


    /**
     * Indicates when to display the error
     */
    selectLearningObjectivesError: false,

    /**
     * @property {String} Question feedback text
     */
    feedbackText: '',

    /**
     * @property {[]} An array of references for the question, where each reference object has the properties:
     * - pid: <product_id>
     * - title: <product_name>
     * - text: <reference_text>
     */
    questionReferences: [],

    /**
    * Reference of Remediation ready to remove
    **/
    remediationLinkToRemove: null,

    /**
     * @property {Component} Async button component for saving questions
     */
    saveButtonComponent: null,

    registerButton: function(buttonComponent) {
        this.set('saveButtonComponent', buttonComponent);
    },

    /**
     * Indicates if the major edit functionality is enabled
     * @property {bool}
     */
    allowMajorEdit: Ember.computed('data-is-admin', 'isEditing', 'data-create-variant', function(){
        return this.get("data-is-admin") &&
            this.get("isEditing") &&
            !this.get("data-create-variant");
    }),

    /**
     * Init Question Object
     */
    initQuestion: function () {
        var createMode = this.get("data-create-mode"),
            question = this.get("data-question");

        this.initQuestionImage(question);
        this.initReferences(question, createMode);
        this.initInteraction(question, createMode);
        this.initFeedbacks(question, createMode);
    }.on('init'),

    filteredProducts: Ember.computed('data-selected-subject', function(){
        var selectedSubject = this.get('data-selected-subject');
        return this.get('data-store').peekAll('product').filter(
            function(product) {
                return product.get('subject') === selectedSubject;
            });
    }),

    filteredSections: Ember.computed('data-selected-product', function(){
        var selectedProduct = this.get('data-selected-product');
        return this.get('data-store').peekAll('section').filter(
            function(section) {
                return section.get('product').get("id") === selectedProduct;
            });

    }),

    filteredLO: Ember.computed('data-selected-section', function(){
        var selectedSection = this.get('data-selected-section');
        return this.get('data-store').peekAll('learningObjective').filter(
            function(learningObjective) {
                if(learningObjective.get('sections')) {
                    var sections = learningObjective.get('sections');
                    for(var x = 0; x < sections.length ; x++) {
                        if(sections[x] === selectedSection) {
                            return true;
                        }
                    }
                } else {
                    return false;
                }

            });
    }),

    observeQuestionImage: Ember.observer('questionImage', function(){
        var self = this;
        if (self.get("questionImage") != null){
            if (self.get("questionImage.content")) {
                self.set("data-question.questionMedia", self.get("questionImage.content"));
            } else {
                self.set("data-question.questionMedia", self.get("questionImage.relativePath"));
            }
        } else {
            //Clean Image
            self.set("data-question.questionMedia", "");
        }
    }),

    /**
     *
     */
    didInsertElement: function () {
        var component = this,
            formContainer = this.$(".question-form"),
            context = Context;

        this.didInsertElementInteraction();

        //Init Html Editor
        if (!context.isTesting()){
            CKEDITOR.replace( 'questionText', {
                toolbar:[
                    ['Format','Bold','Italic','Underline','-','NumberedList','BulletedList','-','Subscript','Superscript','-','Outdent','Indent','Link','Source']
                ],
                removeButtons: ""
            });
        }

        if (!context.isTesting() && component.get("isEditing")){
            CKEDITOR.instances['questionText'].setData(component.get("data-question.questionText"));
        }

        /*****************************************
         *  Set validation to Form and messages
         *******************************************/
        $.validator.addMethod(
            "isHtml",
            function (value) {
                var doc = document.createElement('div');
                doc.innerHTML = value;
                return (doc.innerHTML === value.replace(/&/g, "&amp;"));
            },
            I18n.t('questionLibrary.createQuestions.textQuestionIsHtml')
        );

        // validate form
        formContainer.validate({
            ignore: 'input[type=hidden]',
            onsubmit: false
        });

        // Add validation rules to the question text
        this.$('#question-text').each(function () {

            component.$(this).rules('add', {
                required: true,
                maxlength: 16777215,
                //isHtml: true,
                messages: {
                    required: I18n.t('questionLibrary.createQuestions.textQuestionRequired'),
                    maxlength: I18n.t('questionLibrary.createQuestions.textQuestionMaxLength')
                }

            });
        });

        // Add validation rules to all answer choices
        this.$('.text-section > textarea').each(function () {
            var oldVal = $(this).val();
            $(this).on("input", function(){
                var newVal = $(this).val();
                if(!newVal && !!oldVal){
                    $(this).addClass('answer-choice-remove');
                }
                else if (!!newVal && !!oldVal){
                    $(this).removeClass('answer-choice-remove');
                }
            });
        });

        $(window).click(function(e) {
            if(e.target.id === 'error-modal'){
                $('#error-modal').modal('hide');
            }
        });

        var $select = this.$(".add-learning-objective .lo-select");
        $select.select2({minimumResultsForSearch: 10});
        $select.on("select2:select", function (e) {
                component.addToList(component.get('selectedLearningObjectives'), { id: e.params.data.id , name: e.params.data.text });
                component.$(".add-learning-objective .lo-select").val("").trigger("change");
            });

        // ---------------------------------
        // Validate Input File
        // ---------------------------------
        $.validator.addMethod("accept", function(value, element, param) {
            // Split mime on commas in case we have multiple types we can accept
            var typeParam = typeof param === "string" ? param.replace(/\s/g, '').replace(/,/g, '|') : "image/*",
            optionalValue = this.optional(element),
            i, file;
            // Element is optional
            if (optionalValue) {
                return optionalValue;
            }
            if ($(element).attr("type") === "file") {
                // If we are using a wildcard, make it regex friendly
                typeParam = typeParam.replace(/\*/g, ".*");

                // Check if the element has a FileList before checking each file
                if (element.files && element.files.length) {
                    for (i = 0; i < element.files.length; i++) {
                        file = element.files[i];
                        // Grab the mimetype from the loaded file, verify it matches
                        if (!file.type.match(new RegExp( ".?(" + typeParam + ")$", "i"))) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }, I18n.t("questionLibrary.createQuestions.invalidUrl"));

        var types = this.get('data-input-accepts');
        this.$('input[type=file]').rules('add', {
             accept: types
        });

        Ember.run.scheduleOnce('afterRender', this, this.populateSelectedOptions);
    },

    /**
     *
     */
    willDestroyElement: function () {
        this.willDestroyElementInteraction();
        this.resetValues();
    },

    /**
     *
     * This method is not implemented for this base class
     */
    willDestroyElementInteraction: function(){
        Ember.logger.warn("willDestroyElementInteraction method should be implemented in a sub class");
    },

    /**
     * Setups the interaction during the didInsertElement
     * Base implementation is empty
     */
    didInsertElementInteraction: function () {
        Ember.logger.warn("didInsertElementInteraction method should be implemented in a sub class");
    },


    /**
     * Populates LO and taxonomy and remediation link options
     */
    populateSelectedOptions: function () {
        var component = this,
            selectedTermTaxonomies = component.get("selectedTermTaxonomies"),
            selectedLearningObjectives = component.get("selectedLearningObjectives"),
            selectedRemediationLinks = component.get("selectedRemediationLinks");

        component.get('data-question').get('termTaxonomies').then(function (termTaxonomies) {
            termTaxonomies.forEach(function (termTaxonomy) {
                selectedTermTaxonomies.pushObject(termTaxonomy);
            });
        });
        component.get('data-question').get('learningObjectives').then(function (learningObjectives) {
            learningObjectives.forEach(function (learningObjective) {
                component.addToList(selectedLearningObjectives, {
                    id: learningObjective.get("id"), name: learningObjective.get("name")
                });
            });
        });
         
        component.get('data-question').get('remediationLinks').then(function (remediationLinks) {
            remediationLinks.forEach(function (remediationLink) {
                selectedRemediationLinks.pushObject(remediationLink);
            });
        });

    },


    /**
     * Initializes question feedbacks
     * @param {SakuraiWebapp.Question} question
     * @param {bool} createMode
     */
    initFeedbacks: function (question) {
        var feedbackItems = question.get('feedbacks');

        if (feedbackItems && feedbackItems.length) {
            this.set('feedbackText', feedbackItems[0].text);
        }
    },

    initQuestionImage: function(question) {
        var imagePath = question.get('questionMedia');

        if (imagePath) {
            var slashIdx = imagePath.lastIndexOf('/'),
                questionImage = {
                    relativePath: imagePath,
                    fileName: imagePath.substring(slashIdx + 1),
                    mediaType: question.get('mediaType')
                };
            this.set('questionImage', questionImage);
        }
    },

    /**
     * Initializes question references
     * @param {SakuraiWebapp.Question} question
     */
    initReferences: function (question) {
        var component = this,
            references = question && question.get('references') || [],
            questionProducts = component.get('data-products') || [],
            referencesMap = {},
            questionReferences = [],
            referencesMapKeys;

        // create a map with the ids of the products that already have references
        // where the key will be the productId and the content will be the reference text
        references.forEach(function (reference) {
            referencesMap[reference.product] = reference;
        });

        referencesMapKeys = Object.keys(referencesMap);

        questionProducts.forEach(function (product) {
            var productId = product.get('id'),
                referenceText = '',
                publicationFacts = product.get('publicationFacts'),
                pageNumber = '',
                secondaryInfo = '';

            if (~referencesMapKeys.indexOf(productId)) {
                pageNumber = referencesMap[productId].pageNumber;
                secondaryInfo = referencesMap[productId].secondaryInfo;
                if(!pageNumber && !secondaryInfo && referencesMap[productId].id){
                    referenceText = referencesMap[productId].text;
                }
            }

            questionReferences.push({
                pid: productId,
                title: product.get('title'),
                text: referenceText,
                publicationFacts: publicationFacts,
                pageNumber: pageNumber,
                secondaryInfo: secondaryInfo
            });
        });

        component.set('questionReferences', questionReferences);
    },

    /**
     * Initializes the question interaction
     * Base implementation is empty
     * @param {SakuraiWebapp.Question} question
     */
    initInteraction: function () {
        Ember.logger.warn("initInteraction method should be implemented in a sub class");
    },


    /**
     * Retrieves question feedbacks
     * @param question
     * @returns {*}
     */
    getFeedbacks: function(question){
        var component = this,
            feedbackItems = question.get('feedbacks'),
            feedbackText = component.get('feedbackText');

        if (feedbackItems && feedbackItems.length) {
            feedbackItems[0].text = feedbackText;
        } else {
            // Create an array with a single feedback object
            feedbackItems = [
                { "text": feedbackText }
            ];
        }

        return feedbackText === '' ? [] : feedbackItems;
    },

    /**
     * Retrieves the question references
     * @param question
     * @returns {*|Array}
     */
    getReferences: function (question) {
        var previousReferences = question && question.get('references') || [],
            currentReferences = this.get('questionReferences');

        function findByProductId(arr, pid) {
            var i = arr.length - 1,
                obj;

            for (; i >= 0; i--) {
                obj = arr[i];
                if (obj.product === pid) {
                    return obj;
                }
            }
        }

        currentReferences.forEach(function (reference) {
            var previousRef = findByProductId(previousReferences, reference.pid),
                referenceText = $.trim(reference.text),
                pageNumber = $.trim(reference.pageNumber),
                secondaryInfo = $.trim(reference.secondaryInfo);

            if (previousRef) {
                // If a previous reference exists, then update the object's text
                previousRef.text = referenceText;
                if(pageNumber){
                    previousRef.pageNumber = pageNumber;
                }
                if(secondaryInfo){
                    previousRef.secondaryInfo = secondaryInfo;
                }
            } else {
                // Create a new reference only if there's any text
                if (!!referenceText) {
                    previousReferences.push({
                        text: referenceText,
                        product: reference.pid
                    });
                } else if(reference.publicationFacts && (!!pageNumber || !!secondaryInfo)) {
                    previousReferences.push({
                        text: '',
                        product: reference.pid,
                        pageNumber: pageNumber,
                        secondaryInfo: secondaryInfo
                    });
                }
            }
        });

        return previousReferences;
    },

    /**
     * Set all values for Interaction and return a Json
     * Base implementation is empty
     **/
    getInteractions: function () {
        Ember.logger.warn("getInteractions method should be implemented in a sub class");
        return [];
    },

    /**
     * Validates the interaction section
     * @return {bool}
     */
    validateInteraction: function() {
        Ember.logger.warn("validateInteraction method should be implemented in a sub class");
        return false;
    },

    /**
     * Reset the preview fields to their original state
     */
    resetPreviewFields: function() {
        // Implement in sub class if necessary
    },

    /**
     * Selected nursingConcepts Taxonomy
     */
    parentLOs: Ember.computed("data-learning-objectives.[]", function(){
        return (this.get("data-learning-objectives")) ? LearningObjective.parents(this.get("data-learning-objectives")) : null;
    }),


    /**
     * Adds an item to the list if it is not there already
     * @param list
     * @param item
     */
    addToList: function (list, item) {
        if (!list.findBy('id', item.id)) {
            list.pushObject(item);
        }
    },

    /**
     * getTaxonomyList return an array of taxonomy's
     * id from selected values
     * @param taxonomyList
     * @return array
     */
    getTaxonomyList: function (taxonomyList) {
        var store = this.get("data-store");
        var promises = $.map(taxonomyList, function (taxonomy) {
            return store.find('termTaxonomy', taxonomy.id);
        });
        return Ember.RSVP.all(promises).then(function (taxonomies) {
            return taxonomies.toArray();
        });
    },

    /**
     * Returns an array of LOs
     * id from selected values
     * @param selection ids
     * @return []
     */
    getSelectedLearningObjectives: function (selection) {
        var store = this.get("data-store");
        var promises = $.map(selection, function (item) {
            return store.find('learningObjective', item.id);
        });
        return Ember.RSVP.all(promises).then(function (items) {
            return items.toArray();
        });
    },

    /**
    * @param selection ids
    * @return []
    */

    getSelectedSubjects: function (selection) {
        var store = this.get("data-store");
        var promises = $.map(selection, function(item) {
            return store.find('subject', item.id);
        });
        return Ember.RSVP.all(promises).then(function (items) {
            return items.toArray();
        });
    },

    /**
     * getTaxonomyList return an array of taxonomy's
     * id from selected values
     * @param remediationLinks
     * @return array
     */
    getSelectedRemediationLinks: function (remediationLinks) {
        var store = this.get("data-store");
        var promises = $.map(remediationLinks, function (remediationLink) {
            return store.find('remediationLink', remediationLink.id);
        });
        return Ember.RSVP.all(promises).then(function (_remediationLinks) {
            return _remediationLinks.toArray();
        });
    },

    /**
     * Clean Values
     **/
    resetValues: function () {
        this.get('selectedTermTaxonomies').clear();
        this.get('selectedLearningObjectives').clear();
        this.get('selectedRemediationLinks').clear();
    },

    /**
     * Move cursor to errors labels on create or preview question actions
     */
    scrollToErrorLabel: function () {
        if ($(".error:visible").length > 0) {
            var headerHeight = $("header").height();
            var field = $(".error:visible").first();
            var offset = $(field).offset().top;
            $("html, body").animate({scrollTop: offset - headerHeight}, "slow");
        } else {
            Ember.run.later((function () {
                if ($(".error-label:visible").length > 0) {
                    var field = $(".error-label:visible").first();
                    var headerHeight = $("header").height();
                    var offset = $(field).offset().top;
                    $("html, body").animate({scrollTop: offset - headerHeight}, "slow");
                }
            }), 500);
        }
    },

    actions: {

        /**
         * Save Answer
         **/
        saveQuestion: function (data) {
            var component = this,
                question = component.get("data-question"),
                questionImage = component.get('questionImage');
            component.set("selectLearningObjectivesError", false);

            question.set('feedbacks', component.getFeedbacks(question));
            question.set('references', component.getReferences(question));
            //question.set('subjects', component.getSubjects(question));


            var saveIt = function (taxonomies, learningObjectives, remediationLinks) {
                var learningObjectivesOk = learningObjectives.length > 0;

                // Save a reference to these question array proxies
                var qTermTaxonomies = question.get('termTaxonomies');
                var qLearningObjectives = question.get('learningObjectives');
                var qRemediationLinks = question.get('remediationLinks'),
                    context = Context;

                component.set("selectLearningObjectivesError", !learningObjectivesOk);

                // Clear current relationships to lists of records
                qTermTaxonomies.clear();
                qLearningObjectives.clear();
                qRemediationLinks.clear();

                // Add relationships to new lists of records
                qTermTaxonomies.pushObjects(taxonomies);
                qLearningObjectives.pushObjects(learningObjectives);
                qRemediationLinks.pushObjects(remediationLinks);


                if (!context.isTesting()){
                    component.$('#question-text').val(CKEDITOR.instances['questionText'].getData());
                    component.set("data-question.questionText", CKEDITOR.instances['questionText'].getData());
                }

                var formOk = this.$(".question-form").valid(),
                    interactionOk = component.validateInteraction(),
                    answerChoiceRemovalOk = $('.answer-choice-remove').length && component.get('isMinorEdit') && component.get('allowMajorEdit') ? false : true;

                var saveButton = component.get('saveButtonComponent');
                if (formOk && interactionOk && learningObjectivesOk && answerChoiceRemovalOk) {

                    // Proceed to save the question
                    component.sendAction(
                        "data-save-action",
                        question,
                        !component.get('isMinorEdit'), //is major edit
                        component.get('data-create-variant'),
                        saveButton
                    );
                } else {
                    // Resets the save button if the validation process failed for all question types
                    if (data.component) {
                        component.trigger('asyncButton.restore', data.component);
                    }

                    if (!answerChoiceRemovalOk) {
                        $('#error-modal').modal('show');
                    }
                   component.scrollToErrorLabel();
                }
            };


            Ember.RSVP.hash({
                taxonomies: this.getTaxonomyList(component.get("selectedTermTaxonomies").toArray()),
                learningObjectives: this.getSelectedLearningObjectives(component.get("selectedLearningObjectives").toArray()),
                remediationLinks: this.getSelectedRemediationLinks(component.get("selectedRemediationLinks")),
                interactions: this.getInteractions(),
                subjects: this.getSelectedSubjects(component.get("selectedSubjects").toArray())
            }).then(function (hash) {
                question.set("interactions", hash.interactions);
                var qSubjects = question.get('subjects');
                qSubjects.pushObjects(hash.subjects);
                if (questionImage) {
                    if (questionImage.content) {
                        // If questionImage.content === true, this means an image was uploaded via the file-upload
                        // component. Otherwise, this is a previously saved image that doesn't need to be saved again
                        component.get("data-store")
                            .createRecord("questionMedium", questionImage)
                            .save().then(function (result) {
                                question.set("questionMedia", result.get('relativePath'));
                                question.set("mediaType", result.get('mediaType'));
                                saveIt(hash.taxonomies, hash.learningObjectives, hash.remediationLinks);
                            });
                    } else {
                        question.set("questionMedia", questionImage.relativePath);
                        question.set("mediaType", questionImage.mediaType);
                        saveIt(hash.taxonomies, hash.learningObjectives, hash.remediationLinks);
                    }
                } else {
                    // If there was an image, but then the user decided to remove it while editing then
                    // the values for questionMedia and mediaType must be reset
                    question.set("questionMedia", null);
                    question.set("mediaType", null);
                    saveIt(hash.taxonomies, hash.learningObjectives, hash.remediationLinks);
                }
            }, function(reason) {
                Ember.Logger.error('Unable to fulfill promises to save question: ' + reason);
            });
        },

        addAssociation: function() {
            var component = this;
            var lo = component.get("data-store").getById('learningObjective', component.get('data-selected-LO'));
            component.addToList(component.get('selectedLearningObjectives'), { id: component.get('data-selected-LO'), name: lo.get('name')});
            component.addToList(component.get('selectedSubjects'), { id: component.get('data-selected-subject')});
        },

        openPreview: function () {
            var component = this,
                question = component.get("data-question"),
                context = Context;

            this.getInteractions(true).then( function(interactions) {
                var isFormValid, areInteractionsValid;

                if (!context.isTesting()){
                    component.$('#question-text').val(CKEDITOR.instances['questionText'].getData());
                    component.set("data-question.questionText", CKEDITOR.instances['questionText'].getData());
                }

                question.set("interactions", interactions);
                isFormValid = component.$(".question-form").valid();
                areInteractionsValid = component.validateInteraction();

                var learningObjectivesOk = $('.add-learning-objective').find('.selected-item-text').length > 0;
                component.set("selectLearningObjectivesError", !learningObjectivesOk);

                //todo remove this code once tests validations over select2 plugin are working fine
                if (context.isTesting()) {
                    learningObjectivesOk = true;
                }

                if (isFormValid && areInteractionsValid && learningObjectivesOk) {
                    component.resetPreviewFields();
                    component.$('.modal-full-question').modal('show');
                } else {
                    component.scrollToErrorLabel();
                }
            });
        },

        removeFromList: function (listname, object) {
            var list = this.get(listname);
            list.removeAt(list.indexOf(object), 1);
        },

        cancelChanges: function () {
            var component = this,
                question = component.get("data-question");

            component.sendAction(
                "data-cancel-action",
                question
            );
        },

        saveRemediation:function(remediationLink){
            this.get("selectedRemediationLinks").pushObject(remediationLink);
        },

        onShowConfirmation: function(remediationLink){
            this.$('.remove-remediation-message-modal').modal('show');
            this.set("remediationLinkToRemove", remediationLink);
        },

        onCancelConfirmation: function(){
            this.$('.remove-remediation-message-modal').modal('hide');
        },

        onRemoveRemediation: function(){
            var component = this,
                store = component.get('data-store'),
                remediationLink = component.get("remediationLinkToRemove");

            store.deleteRecord(remediationLink);

            return remediationLink.save().then(function(){
                component.get("selectedRemediationLinks").removeObject(remediationLink);
                component.$('.remove-remediation-message-modal').modal('hide');
            });
        },

        /**
         * When enabling remediation
         * @param remediationLink
         */
        onShowEditRemediationLink: function (remediationLink){
            remediationLink.set("editable", true);
        },

        /**
         * When enabling remediation
         * @param remediationLink
         */
        onUpdateRemediationLink: function (remediationLink){
            remediationLink.save().then(function(){
                remediationLink.set("editable", false);
            });
        }

    }
});
