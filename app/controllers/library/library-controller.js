import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import Question from 'models/question';

export default Controller.extend(
    ControllerMixin,
    FeatureMixin,{
        
    //Reference to another controller
    instructor: Ember.inject.controller(),

    instructorController: Ember.computed.alias("instructor"),

    /**
     * @property {Ember.A} alias of current active classes from injected class controller
     */
    activeClasses: Ember.computed.alias("instructor.activeClasses"),

  	/**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {Section[]} list of sections
     */
    sections: null,

    /**
     * @property {QuestionSet[]} list of question Collections
     */
    questionSets: null,

    /**
     * @property {Product} Product of current class
     */
    product: null,

    /**
     * @property {termTaxonomies[]} list of term taxonomies for filters
     */
    termTaxonomies: null,

    /**
     * @property {user[]} list of Authors for filters
     */
    authors: null,

    /**
     * @property {Ember.A} list of other Products by questions
     */
    otherProducts: Ember.A(),

    /**
     * @property {string} title to show in the modal window for term taxonomies
     */
    taxonomyModalTitle: "",

    /**
     * @property {string} type of term taxonomies being filtered in the modal window
     */
    taxonomyModalType: "",

    /**
     * @property {Ember.A} list of all term taxonomies that may be shown in the modal window
     */
    allTermTaxonomies: Ember.A(),

    /**
     * @property {Ember.A} list of all term taxonomies concepts
     */
    termTaxonomiesConcepts: Ember.A(),

    /**
     * @property {string} select default data type for load screens
     */
    defaultDataType: null,

    /**
     * @property {number} total created question for this instructor
     */
    totalCreatedQuestions: 0,

    /**
     * @property {number} number of question collections the instructor has for the current subject
     * The subject is inferred by the BE from the product selected
     */
    questionSetsEnabledForCurrentSubject: 0,

    /**
     * difficulty range levels
     */
    difficultyRangeLevels: Ember.computed('product', function(){
        var difficultyRangeLevels = this.get('product').get('difficultyRangeLevels');
        var ranges = [];
        for (var i = 0; i < difficultyRangeLevels.length - 1; i++) {
            ranges.pushObject(Ember.Object.create({keyCode: (i === 0 ? difficultyRangeLevels[i] : difficultyRangeLevels[i] + 1) + '|' + difficultyRangeLevels[i + 1],
                                                   display: (i === 0 ? difficultyRangeLevels[i] : difficultyRangeLevels[i] + 1) + ' - ' + difficultyRangeLevels[i + 1]}));
        }
        return ranges;
    }),

    /**
     * computed property watches class property so we can derive the product id and get the correct
     * classes when we switch classes
     * @property {computed property} My active classes for the current product
     */
    myClasses: Ember.computed('product', 'activeClasses.[]', function(){
        var productId = this.get('product').get('id');
        var instructorController = this.get("instructorController");
        return instructorController.getActiveClassesByProduct(productId);
    }),

    /**
     * @property {question Status} List of question Status
     */
    questionStatusList: Ember.computed(function(){
        return Question.questionStatuses();
    }),

    /**
     * @property to show chapter or Nursing Topics
     */
    filterChapterTitle: Ember.computed('product', function(){
        var chapterTerminology = this.get('terminologyTermPlural');
        var defaultTerminology = I18n.t('chapters', { count: 2 });
        if (chapterTerminology){
            return chapterTerminology;
        }
        else{
            return defaultTerminology;
        }
    }),

    /**
     * Indicates if should display share QC option
     * @property {bool}
     */
    showShareQuestionCollection: Ember.computed(function(){
        return this.showModuleByToggle("shareQuestionCollection");
    }),

    /**
     * Indicates if should display filter by difficulty
     * @property {bool}
     */
    showFilterByDifficulty: Ember.computed(function(){
        return this.showModuleByToggle("filterByDifficulty");
    }),

    /*********************************************************
	* M E T H O D S
    *********************************************************/

    /**
	* Add an Object to list of Question Collections
    **/
    addQuestionCollection: function(newQC){
    	//this.get("questionSets").pushObject(newQC);item._internalModel
      this.get("questionSets").insertAt(0, newQC._internalModel);
    },

    /**
     * Filter question set bt enabled property
     */
    questionSetsEnabled: Ember.computed('questionSets.@each.enabled', function(){
        var questionSets = this.get('questionSets');
        return questionSets.filterBy('enabled', true);
    }),

    groupedQuestionSets: Ember.computed('questionSets.@each.enabled', 'showShareQuestionCollection', function(){
        var results = [];
        var ownQS = [];
        this.get('questionSets').forEach(function(item){
            var parentOwner = item.get('parentOwner');
            var enabled = item.get('enabled');
            var parentOwnerId = parentOwner.get('id');
            if (enabled) {
                if (parentOwnerId) {
                    var hasParent = results.findBy('parentOwnerId', parentOwnerId);
                    if(!hasParent) {
                        results.pushObject(Ember.Object.create({parentOwnerId: parentOwnerId,
                                                                parentOwnerFullNameInformal: item.get('parentOwner').get("fullNameInformal"),
                                                                parentOwnerFullName: item.get('parentOwner').get("fullName"),
                                                                contents: []}));
                    }
                    results.findBy('parentOwnerId', parentOwnerId).get('contents').pushObject(item);
                } else {
                    ownQS.pushObject(item);
                }
            }
        });
        var ownQSObj = Ember.Object.create({parentOwnerId: 0, contents: ownQS});
        var showShareQuestionCollection = this.get('showShareQuestionCollection');
        if (showShareQuestionCollection) {
            results = results.sortBy("parentOwnerFullName");
            results.unshiftObject(ownQSObj);
        } else {
            results = [];
            results.pushObject(ownQSObj);
        }
        return results;
    }),

    /**
     * Increases the total created questions
     */
    incTotalCreatedQuestions: function(){
        var total = this.get("totalCreatedQuestions");
        this.set("totalCreatedQuestions", total + 1);
    },

    /**
     * Decreases the total created questions
     */
    decTotalCreatedQuestions: function(){
        var total = this.get("totalCreatedQuestions");
        this.set("totalCreatedQuestions", total - 1);
    },

    /**
     * Resize left menu navigation in order to allow scroll when needed
     */
    resizeLeftNavigation: function() {
        $(".left-menu").css("max-height", "790px");
    }
});
