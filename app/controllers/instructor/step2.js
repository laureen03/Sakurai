
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import QuestionSet from 'sakurai-webapp/models/question-set';
import TermTaxonomy from 'sakurai-webapp/models/term-taxonomy';
import Section from 'sakurai-webapp/models/section';
import context from 'sakurai-webapp/utils/context';


export default Ember.Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin, {
    instructorManageAssignment: Ember.inject.controller(),
    instructorAssignStep3: Ember.inject.controller(),
  	manageAssignment: Ember.computed.alias('instructorManageAssignment'),

  	/*------------------------------------------------
	* V A R I A B L E S
    ------------------------------------------------*/
	/**
     * @property {Assignment} Current Assignment
     */
    assignment: Ember.computed.alias("instructorManageAssignment.assignment"),

    /**
     * @property {Product} Current Product of the class
     */
    product: Ember.computed.alias("instructorManageAssignment.product"),

    /**
     * @property {Class} Current Class
     */
    class: Ember.computed.alias("instructorManageAssignment.class"),

    /**
     * @property {bool} is edit mode
     */
    isEditMode: Ember.computed.alias("instructorManageAssignment.isEditMode"),


    /**
     * @property {string} selected term taxonomy
     */
    selectedTermTaxonomy: Ember.computed.alias("instructorManageAssignment.selectedTermTaxonomy"),

	/**
     * @property questions from a particular QC
     */
    questions: null,

    /**
     * @property get all QC created by user
     */
    questionSets: Ember.A(),

    /**
     * @property {QuestionSet} selected question collection
     */
    questionSet: null,

    /**
     * @property hold the selected question collection value
     */
    qcSelected: null,

    /**
     * This is a list of sections
     * @property {Section[]} sections
     */
    sections: Ember.A(),

    /**
     * @property {number} retrieve the value of the selected chapter in the list
     */
    chapterSelected: null,

    /**
     * This corresponds to the chapter id
     * @property {string} chapter pre selected from the query param
     */
    chapterIdPreSelected: null,

    /**
    * @property question number for the selected set
    */
    numberQuestions: null,

    /**
     * @property default value for the mastery level when a new ML assignment is created
     */
    defaultMasteryLevel: 3,

    /**
     * @property {string} term taxonomy type parameter
     */
    type: null,

    /**
     * @property show section dropdown
     * @default TRUE
     * @unless metadata types
     */
    isSectionAssignment: true,

    /**
     * @property metadata option list
     */
    metadataOptions: null,

    /**
     * @property metadata selected subcategory
     */
    metadataSelected: null,

    /**
     * @property {bool} Should an error be displayed for trying to include content (chapter or term taxonomy)
     * into an ML assignment that has been tagged as 'hidden' (hidden_filter) by an admin
     */
    hiddenFilterError: false,

    /*-----------------------------------------------
                          I N I T
    _________________________________________________*/
    initController: function () {
        this._super();
        Ember.run.schedule("afterRender",this,function() {
            //Init Validator
            $("#assign-a-quiz").validate({
                ignore: 'input[type=hidden]',
                onsubmit: false,
                rules: {
                    assignName: {
                        required: true,
                        maxlength: 50
                    }
                },
                messages: {
                    assignName: {
                        required: I18n.t('assignQuiz.assignmentNameErrors.required'),
                        maxlength: I18n.t('assignQuiz.assignmentNameErrors.max')
                    }
                }
            });
            //Init Select 2
            $('select').select2({
                minimumResultsForSearch: -1
            });
        });
    }.on('init'),

    /**
     * @property {string} defines the way that taxonomies should be grouped, empty string if is by taxonomy tag
     */
    groupOption: Ember.computed('selectedTermTaxonomy', function(){
        var controller = this;
        var groupValue = 'group';
        if (this.validateTaxonomyTagConcepts(controller.get('selectedTermTaxonomy'))) {
            groupValue = "";
        }
        return groupValue;
    }),

    /**
     * @method fills with the correct list the metadataOptions dropdown menu
     *         manage if the section dropdown will show
     */
    metadataSubCategory: Ember.observer('selectedTermTaxonomy', function(){
        var isEditMode = this.get("isEditMode");
        var selectedTermTaxonomy = this.get("selectedTermTaxonomy");
        if (isEditMode || !selectedTermTaxonomy){ return; }//when editing there is no need to load the taxonomies

        var controller = this;
        var store = controller.get("store");
        var type = controller.get('selectedTermTaxonomy');

        if (type === Section.NURSING_TOPICS){
            controller.set('isSectionAssignment',true);
            this.onChapterChange();
            Ember.run.later((function () {
                $('select').select2({
                        minimumResultsForSearch: -1
                    });
            }), 100);
        }
        else{
            controller.set('isSectionAssignment',false);

            var taxonomyTag = context.get('authenticationManager').get("taxonomyTag");
            if (this.validateTaxonomyTagConcepts(type))
            { //Find by GuID
                TermTaxonomy.findTermTaxonomyByTaxonomyTag(store, taxonomyTag, null)
                    .then(function(metadata){
                        controller.transformAndSetFirst(metadata, type);
                    });
            }else{
                TermTaxonomy.findTermTaxonomyByParentName(store, type, null)
                .then(function(metadata){
                    controller.transformAndSetFirst(metadata, type);
                });
            }
        }

    }).on('init'),


    /**
     * Can Transforms the metadata objects and set the first object
     * @param {string} type nursing_concepts, client_needs
     * @param metadata
     */
    transformAndSetFirst: function(metadata, type){
        Ember.run.later((function () {
                $('select').select2({
                        minimumResultsForSearch: -1
                    });
            }), 100);

        var controller = this;
        var _metadata = controller.transformMetadata(type, metadata);
        controller.set('metadataSelected',_metadata[0].id);
        controller.set("metadataOptions", _metadata);
    },


    /**
     * Transforms the metadata objects into the view structure
     * @param {string} type nursing_concepts, client_needs
     * @param metadata
     * @returns {Array} [ { "id":1, "name": "Nursing Concepts" } ]
     */
    transformMetadata: function(type, metadata){
        var filtered = []; //contains the metadataList grouped by parent
        if (this.validateTaxonomyTagConcepts(type)) {
            metadata.forEach(function(parent){
                var levelTwoMetadata = metadata.filterBy("parent", parseInt(parent.get("id")));
                levelTwoMetadata.map(function(metadata){
                    filtered.push( {
                        "name" :  metadata.get('name'),
                        "id": metadata.get('id'),
                    });
                });
            });
            filtered = filtered.sortBy('name');
        } else {
            metadata.forEach(function(parent){
                var levelTwoMetadata = metadata.filterBy("parent", parseInt(parent.get("id")));
                levelTwoMetadata.map(function(metadata){
                    filtered.push( {
                        "name" :  metadata.get('name'),
                        "id": metadata.get('id'),
                        "group": parent.get("name")
                    });
                });
            });
        }

        return filtered;
    },

    /*------------------------------------------------
	* P R O P E R T I E S
    ------------------------------------------------*/
    bodyMasteryModal: Ember.computed(function(){
        return  '<p>'  + I18n.t('assignQuiz.bodyMasteryModal') + '</p>' +
                '<h4>' + I18n.t('assignQuiz.subTitleMasteryModal1') + '</h4>' +
                '<p>'  + I18n.t('assignQuiz.bodyMasteryModal1') + '</p>' +
                '<h4>' + I18n.t('assignQuiz.subTitleMasteryModal2') + '</h4>' +
                '<p>'  + I18n.t('assignQuiz.bodyMasteryModal2') + '</p>';
    }),

    enableContinueBtn: Ember.computed('questionSetsEnabled', "assignment.type", function(){
        if (this.get("assignment").get("isQuestionCollectionAssignment") && (this.get("questionSetsEnabled").length === 0)){
            return false;
        }
        else{
            return true;
        }
    }),

    /**
     * Filter question set bt enabled property
     */
    questionSetsEnabled: Ember.computed('questionSets.[]', function(){
        var options = Ember.A();
        var questionSets = this.get('questionSets');
        var enabled = questionSets.filterBy('enabled', true);

        enabled.forEach(function(obj){
            //Show QC that have more than 1 question
            if(obj.get('totalQuestions') > 0){
                options.pushObject({
                    id: obj.get("id"),
                    label: obj.get('label')
                });
            }
        });
        return options;
    }),

    /**
     * computed property for the drop down. watches the class property for changes
     * this allows us to reset the section per product when a class changes
     * @property {computed} an object with chapter id, chapter name, and section group to group by
     */
    sectionGroups: Ember.computed('sections.[]', function(){
        var options = Ember.A();
        this.get('sections').forEach(function(section) {
            section.get('children').then(function(children){
                var optionGroup = children.map(function(kid){
                    return Ember.Object.create(
                        {   id: kid.get('id'),
                            name: kid.get('name'),
                            group: section.get('name'),
                            externalId: kid.get("externalId")
                        });
                });
                options.pushObjects(optionGroup);
            });
        });
        return options;
    }),

    /*------------------------------------------------
	* O B S E R V E S
    ------------------------------------------------*/
    /**
     * Select the first chapter by default when the section list changes
     */
    selectDefaultChapter: Ember.observer('sectionGroups.[]', function(){
        var controller = this;
        var options = controller.get("sectionGroups");
        var hasSections = options.get("length") > 0;
        if (hasSections){
            var chapterIdPreSelected = controller.get("chapterIdPreSelected");
            var preSelected = controller.get("isChapterPreselected");
            var chapterFound = false;
            if (preSelected){
                var chapters = options.filterBy('id', chapterIdPreSelected);
                chapterFound = chapters.get("length") > 0;
                if (chapterFound){
                    controller.set("chapterSelected", chapterIdPreSelected);
                }
            }

            if (!chapterFound){
                controller.set("chapterSelected", options.nextObject(0).id);
            }
        }
    }),


    /**
     * Indicates if the chapter was preselected
     */
    isChapterPreselected: Ember.computed('chapterIdPreSelected', function(){
        return this.get("chapterIdPreSelected") != null;
    }),

    /**
     * Select the first question set by default when the list changes
     */
    selectDefaultQuestionSet: Ember.observer('questionSets.[]', function(){
        var options = this.get("questionSetsEnabled");
        if (options.get("length") > 0){
            this.set("qcSelected", options.nextObject(0).id);
        }
    }),

    metadataDropDownEnabled: Ember.computed('isMetadataAllowed', function(){
        var manageAssignment = this.get("manageAssignment");
        return  this.get("isMetadataAllowed") &&
                manageAssignment.get("termTaxonomyTypeOptions").length > 1;
                //the drop down is not necessary with one option
    }),

    /**
     * Check that the chapter can be selected (i.e. it is not subject to
     * any author filters -see PUSAK-1391)
     */
    onChapterChange: Ember.observer('chapterSelected', function(){
        var chapterId = this.get("chapterSelected"),
            self = this;

        if (chapterId) {

            this.getSelectedChapter(chapterId).then( function(selectedChapter) {
                selectedChapter.get('chapterFilters').then( function() {
                    // chapterFilters must have already been loaded for the 'hasHiddenFilter'
                    // property to work correctly
                    self.set('hiddenFilterError', !!selectedChapter.get('hasHiddenFilter'));
                });
            });
        }

    }).on('init'),

    /**
     * Check that the metadata term can be selected (i.e. it is not subject to
     * any author filters -see PUSAK-1391)
     */
    onTermTaxonomyChange: Ember.observer('metadataSelected', function(){

        var termTaxonomyId = this.get("metadataSelected"),
            self = this;

        if (termTaxonomyId) {

            this.getSelectedTermTaxonomy(termTaxonomyId).then( function(selectedTermTaxonomy) {
                selectedTermTaxonomy.get('termTaxonomyFilters').then( function() {
                    // termTaxonomyFilters must have already been loaded for the 'hasHiddenFilter'
                    // property to work correctly
                    self.set('hiddenFilterError', !!selectedTermTaxonomy.get('hasHiddenFilter'));
                });
            });
        }

    }).on('init'),

    /*------------------------------------------------
	* M E T H O D S
    ------------------------------------------------*/

    initQCAssignment: function(questionSets){
    	this.get("questionSets").clear();
        this.get("questionSets").addObjects(questionSets);
    },

    /**
     * Inits the mastery level assignment
     * @param sections
     * @param {string} chapterId preselected chapter
     */
    initMLAssignment: function(sections, chapterId){
        var controller = this;
        this.set("chapterIdPreSelected", chapterId);
    	this.get("sections").clear();
        this.get("sections").addObjects(sections);
        Ember.run.later((function () {
            $("#select-chapter").val(controller.get("chapterSelected")).trigger("change");
        }), 100);

    },

    /**
     * Return selected chapter
     * @param id
     * @return {Ember.RSVP.Promise}
     */
    getSelectedChapter: function(id){
        var sections = this.get("sections");
        return new Ember.RSVP.Promise(function (resolve) {
            sections.forEach(function(section) {
                section.get('children').then(function(children){
                    children.forEach(function(kid) {
                        if (kid.get("id") === id){
                            kid.set("parentName", section.get("name"));
                            resolve(kid);
                        }
                    });
                });
            });
        });
    },

    /**
     * Return selected term Taxonomy
     * @param id
     * @return {Ember.RSVP.Promise}
     */
    getSelectedTermTaxonomy: function(id){
        var controller = this;
        var store = controller.store;
        return new Ember.RSVP.Promise(function (resolve) {
            var promise = store.find('termTaxonomy',id);
                promise.then(function(metadata){
                    resolve(metadata);
                });
        });

    },

    resetAssignmentValues: function () {
        this.set('assignment.name', '');
        this.get('assignment').set('targetMasteryLevel', this.defaultMasteryLevel);
        this.set('qcSelected', null);
    },

    resetValues: function(){
        this.get("sections").clear();
        this.set("chapterSelected", null);
        this.set("chapterIdPreSelected", null);
    },

    actions:{
        continueStepTwo: function(){
            var controller = this,
                assignment = this.get("assignment");

            if ($("#assign-a-quiz").valid() && !this.get('hiddenFilterError')) {

                if (assignment.get("isQuestionCollectionAssignment")){
                    var questionSets = this.get('questionSets');
                    var questionSetSelected = questionSets.filterBy('id', controller.get('qcSelected'));
                    questionSetSelected = questionSetSelected.nextObject(0);
                    controller.set("questionSet", questionSetSelected);
                    //Change step3
                    controller.get("instructorAssignStep3").initStep3(questionSetSelected);
                    controller.get("manageAssignment").changeStepSelected("2", "3");
                }
                else{
                    //Set Chapter or metadata
                    var isSectionAssignment = this.get('isSectionAssignment');
                    var promise = (isSectionAssignment) ?
                            controller.getSelectedChapter(controller.get('chapterSelected')) :
                            controller.getSelectedTermTaxonomy(controller.get('metadataSelected'));
                    promise.then(function(data){
                        controller.get("assignment").set("chapter", undefined);
                        controller.get("assignment").set("termTaxonomy", undefined);

                        if (isSectionAssignment){
                            controller.get("assignment").set("chapter", data);
                        }else{
                            controller.get("assignment").set("termTaxonomy", data);
                        }


                        //Change step3
                        controller.get("instructorAssignStep3").initStep3(null);
                        controller.get("manageAssignment").changeStepSelected("2", "3");
                    });
                }
            }
        },

        onPreview: function(data){
            var controller = this;
            var selectedQuestionSetId = this.get('qcSelected');
            var questionSets = this.get('questionSets');
            var found = questionSets.filterBy('id', selectedQuestionSetId);

            QuestionSet.fetch(found.nextObject(0)).then(function(questionSet){

                var questions = questionSet.get("questions");
                questions.then(function(_questions) {
                    controller.set('questionSet', questionSet);
                    controller.set('questions', _questions);

                    Ember.Logger.debug(controller.toString() + ': questions loaded ... ask view to show modal');
                    $('#preview-modal').modal('show');
                    controller.trigger('asyncLink.restore', data.component);
                });
            });
        },

        exitPreview: function () {
            // reset questions
            Ember.Logger.debug(this.toString() + ': reset controller data');
            this.set('questions', null);
            this.set('questionSet', null);
        },

        goBackStepOne: function() {
            $('#assignName-error').empty();
            $('#assignName-error').css("display", "none");
            $('#assignName').removeClass("error");

            var ml_slider = $('#ml-slider');
            if (ml_slider) {
                ml_slider.slider('value', this.get('defaultMasteryLevel'));
            }

            this.resetAssignmentValues();
            if (this.get("isChapterPreselected")){
                window.history.back();
            }
            else{
                this.get("manageAssignment").changeStepSelected("2", "1");
            }
        }
    }


});
