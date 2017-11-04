import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import Product from 'models/product';
import Assignment from 'models/assignment';
import TermTaxonomy from 'models/term-taxonomy';
import context from 'utils/context-utils';


export default Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin,{

    headerClasses: Ember.inject.controller(),
    instructor: Ember.inject.controller(),
    instructorAssignStep2: Ember.inject.controller(),
    instructorAssignStep3: Ember.inject.controller(),

    queryParams: ['qsId', "chapterId", "action"],

    /**
     * @property {number} Question set if from query paramn
     */
    qsId: null,

    /**
     * @property {number} Chapter id pre selected from query param
     */
    chapterId: null,
    /**
    * @property {String} action on an assignment
    **/
    action: null,

    /**
    * @property {String} assignment type
    **/
    assigmentType: "mastery_level",

    /*
     * ================================================================
     * Variables
     * ================================================================
     */
    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {Assignment} Current Assignment
     */
    assignment: null,

    /**
     * @property {boolean} Determine if editing or creating a new assignment
     */
    isEditMode: false,

    /**
     * @property {boolean} Determine if copying an assignment
     */
    isCopyMode: false,

    /**
     * @property {Boolean} Status is the assignment was saved
     */
    assignmentCreated: false,

    /**
     * @property {product} gets the product
     */
    product: null,

    /**
     * @property {bool} Control if settings are active;
     */
    activeSettings: false,

    /**
    Allow review and refresh Product Settings
    **/
    allowReviewAndRefresh: Ember.computed(function(){
        return this.get("product.isRRAllowed");
    }),

    /**
     * @property {bool} Showing about review and refrsh details
     */
    activeAboutReviewAndRefresh: false,

    /**
     * @property {bool} Showing about review and refrsh details
     */
    activeReviewAndRefreshSettings: false,

    /**
     * Indicates if a question collection is pre selected
     * @property
     */
    isQuestionCollectionPreSelected: Ember.computed('qsId', function(){
        return this.get("qsId") !== null;
    }),

    /**
     * Indicates if a chapter is pre-selected
     * @property
     *
     */
    isChapterPreSelected: Ember.computed('chapterId', function(){
        return this.get("chapterId") !== null;
    }),

    /**
     * @property Selected term taxonomy value for combobox
     */
    selectedTermTaxonomy: null,

    /**
     * @property Selected term taxonomy option list for combobox
     */
    termTaxonomyTypeOptions: null,

    otherAnswersForTextEntry: Ember.ArrayProxy.create({ content: Ember.A([]) }),

    classesAndDates: Ember.A(),

    /**
     * @property return if the assignment is metadata and has chapters
     */
    isTermTaxonomyNursingTopic: Ember.computed('assignment.chapter','isMetadataAllowed', function(){
        return this.get('isMetadataAllowed') && this.get('assignment').get('hasChapter');
    }),

    /**
     * @property {string} label for the selected term taxonomy type
     */
    termTaxonomyLabel: Ember.computed("selectedTermTaxonomy", "product", function(){
        var product = this.get("product");
        var key = this.get("selectedTermTaxonomy");
        var termTaxonomyAllowed = Product.termTaxonomyAllowedByKey(product, key);
        return termTaxonomyAllowed.label;
    }),

    /*
     * ================================================================
     * Methods
     * ================================================================
     */

     /*
        Init new assignment
     */
    initAssignment: function(){
        var defaultMasteryLevel = this.get("instructorAssignStep2").get('defaultMasteryLevel');

        var assignment = this.store.createRecord("assignment");
        assignment.set('targetMasteryLevel', defaultMasteryLevel);

        this.set("assignment", assignment);
    },

    initCopyAssignment: function(assignment) {
        var newAssignment = assignment.toJSON();
        delete newAssignment.classes;
        delete newAssignment.studentResults;
        for (var key in newAssignment) {
            if(key !== 'classes') {
                if (newAssignment[key] !== assignment.get(key)) {
                    newAssignment[key] = assignment.get(key);
                }
            }

        }
        newAssignment.id = null;
        newAssignment.staggered = true;
        newAssignment = this.store.createRecord("assignment", newAssignment);

        this.set("assignment", newAssignment);
        this.setAssignment(newAssignment);
    },


    /**
     * Identifies the parent type for the assignment taxonomy
     * @param assignment
     */
    identifyTermTaxonomyTypeIfNecessary: function(assignment){
        var controller = this;
        var product = this.get("product");
        if (assignment.get("hasTermTaxonomy")){
            assignment.get("termTaxonomy").then(function(taxonomy){
                var parentType = TermTaxonomy.getParentType(product, taxonomy);
                controller.set("selectedTermTaxonomy", parentType);
            });
        }
    },

    setAssignment:function(assignment){
        this.get("instructorAssignStep3").setAssignment(assignment);
    },

    /*
        Change the Step and also the style of the breadcrumb
     */
    changeStepSelected: function(stepSelected, newStepToSelect){
    	$(".step" + stepSelected).hide();
        $(".step" + newStepToSelect).show();
        $(".label-step" + stepSelected).removeClass("selected");
        $(".label-step" + newStepToSelect).addClass("selected");
    },

    resetValues: function(){
        var controller = this;
        if (controller.get("isEditMode")){ //Clean changes if assignment is dirty
            controller.get("assignment").rollbackAttributes();
        }
        controller.set("assignmentCreated", false);
        controller.set("isEditMode", false);
        controller.set("qsId", null);
        controller.set("selectedTermTaxonomy", null);
        controller.set("chapterId", null);
        controller.set("assigmentType", "mastery_level");
        controller.get("instructorAssignStep3").resetValues();
        controller.get("instructorAssignStep2").resetValues();
    },

    /**
     * @method create a list with info to show the last confirmation Page
     */
    setClassesAndDates: function(){
        var self = this;
        var assignment = self.get("assignment");
        var store = this.store;
        self.get("classesAndDates").clear();
        JSON.parse(assignment.get("customDataByClass")).forEach(function (dateByClass) {
            store.find("class", dateByClass.idClass).then(function(clazz){
                var obj = {
                    "idClass" : clazz.get("id"),
                    "name": clazz.get("name"),
                    "term": clazz.get("term"),
                    "isUnknownTerm": clazz.get("isUnknownTerm"),
                    "availableDate"  : new Date(dateByClass.availableDate),
                    "dueDate" : new Date(dateByClass.dueDate),
                    "timeZone" : dateByClass.timeZone
                    };

                self.get("classesAndDates").pushObject(obj);
            });
        });
    },

    saveAssignment: function(myAssignment){
        var controller = this;
        var promise = myAssignment.save();
        promise.then(function (assignment) {
            controller.resolveAssignment(assignment).then(function(){
                if (controller.get("isEditMode") && !controller.get("isCopyMode")){
                    controller.transitionToRoute("/instructor/assignments/"+controller.get("product").get("id")+'/'+controller.get("class").get("id"));
                }
                else{
                    if (assignment.get("staggered")){ //create a list with classes and Dates
                        controller.setClassesAndDates();
                    }
                    controller.set("assignmentCreated", true);
                }
            });
        }, function(reason){
            myAssignment.rollbackAttributes(); //rolling back changes since it is affecting a data ember model
            controller.send('error', {
                reason: reason,
                i18nCodes : {
                    "cannot_modify_demo_data" : "error.assignments.canNotEditDemoAssignment"
                }
            });
        });
    },

    /**
     * Resolves the assignment dependencies
     * @param assignment
     */
    resolveAssignment: function(assignment){
        return assignment.get("classes").then(function(classes){
            var products = classes.map(function(clazz){
                return clazz.get("product");
            });
            return Ember.RSVP.all(products);
        });
    },

    /**
     * @[method]
     * Send the stepOne Action when the assignment
     * comes from Question Library Assign Button
     */
    nextStep: function(){
        if (this.get("isQuestionCollectionPreSelected")){
            this.set("assigmentType",Assignment.QUESTION_COLLECTION);
        }
        else if (this.get("isChapterPreSelected")){
            this.set("assigmentType", Assignment.MASTERY_LEVEL);
        }

        this.send('continueStepOne');
    },

    /*
     * ================================================================
     * Actions
     * ================================================================
     */

    actions:{
    	continueStepOne: function(){

            var controller = this;
            var store = this.store;
            var product = this.get("product");
            var assignment = this.get("assignment");
            var isQuestionCollectionAssignment =  this.get('isQuestionCollectionPreSelected');
            var qsId = this.get('qsId');

            if(this.get("assigmentType") === 'existing_assignment') {
                this.transitionToRoute("/instructor/assignments/"+product.get("id")+'/'+this.get("class").get("id")+'?prevPage=manageAssignment');
            } else if (this.get("assigmentType") === 'change_settings') {
                this.set('activeReviewAndRefreshSettings', true);
            } else {
                //Sets the Assignment Type
                assignment.set("type", controller.get("assigmentType"));

                if (assignment.get("isQuestionCollectionAssignment")){
                    var authenticationManager = context.get('authenticationManager');
                    var user = authenticationManager.getCurrentUser();
                    store.query("questionSet", { "userId": user.get("id"), "productId": product.get("id")})
                        .then(function(questionSets){
                            controller.get("instructorAssignStep2").initQCAssignment(questionSets);
                            if(isQuestionCollectionAssignment){
                                controller.get("instructorAssignStep2").set('qcSelected',qsId);
                            }
                            controller.changeStepSelected("1", "2");
                    });
                }
                else{
                    var clazz = this.get("class");
                    store.query('section', {classId: clazz.get("id")}).then(function(sections){
                        var chapterId = controller.get("chapterId");
                        controller.get("instructorAssignStep2").initMLAssignment(sections, chapterId);
                        controller.changeStepSelected("1", "2");
                    });
                }
            }
    	},
        onShowAboutReviewAndRefresh: function() {
            this.set('activeAboutReviewAndRefresh', true);
        },

        onChangeSettings: function(value){
            this.set("activeSettings", value);
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

        copyAssignment: function() {
            this.changeStepSelected(1, 3);
        }
    }

});
