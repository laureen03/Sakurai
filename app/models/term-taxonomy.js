import DS from 'ember-data';
import Ember from "ember";
import TermTaxonomy from "../models/term-taxonomy";
import Section from "../models/section";

export default DS.Model.extend({
	/**
     * @property {string} type, mastery_level, question_collection
     */
	parent: DS.attr('number'),
	/**
     * @property {string} type, mastery_level, question_collection
     */
    name: DS.attr('string'),
    /**
     * @property {string} type, mastery_level, question_collection
     */
    type: DS.attr('string'),

    /**
     * @property {string} description
     */
	description: DS.attr('string'),
    /**
     * @property {string} path
     */
    path: DS.attr('string'),
    /**
     * @property {number} termOrder
     */
    termOrder: DS.attr('number'),

    /**
     * @property {TermTaxonomyFilter[]} array of term taxonomy filter IDs
     */
    termTaxonomyFilters: DS.hasMany('termTaxonomyFilter', { async: true }),

    /**
     * Indicates if this taxonomy should be hidden from practice quizzes
     */
    isHiddenFromPracticeQuiz: Ember.computed('termTaxonomyFilters.[]', function(){
        var filters = this.get("termTaxonomyFilters");
        var hidden = false;
        filters.forEach(function(filter){
            if (filter.get("isPracticeQuizFilter") || filter.get("isHiddenFilter")) {
                hidden = true;
            }
        });
        return hidden;
    }),

    /**
     * Indicates if this taxonomy filter was created by Admin user
     */
    hasHiddenFilter: Ember.computed('termTaxonomyFilters.[]', function(){
        var filters = this.get("termTaxonomyFilters");
        return filters.filterBy('isHiddenFilter').length;
    }),

    typeAndName: Ember.computed("type", "name", function(){
        var type = this.get("type");
        var name = this.get("name");
        if (type.trim() !== "") {
            name = type + ": " + this.get("name");
        }
        return name;
    }),

    bloomName: Ember.computed("termOrder", "name", function(){
        var termOrder = this.get("termOrder");
        var name = this.get("name");
        if (termOrder !== undefined){
            name =  termOrder + ". " + name;
        }
        return name;
    }),

    /*
    * Indicate if is a Blooms Taxonomy
    */
    isBlooms: Ember.computed('type', function(){
        return TermTaxonomy.isType(this, TermTaxonomy.BLOOM_TAXONOMY);
    }),

    isNursingConcepts: Ember.computed('path', function(){
        return TermTaxonomy.isType(this, TermTaxonomy.NURSING_CONCEPTS);
    }),

    isClientNeeds: Ember.computed('path', function(){
        return TermTaxonomy.isType(this, TermTaxonomy.CLIENT_NEEDS);
    }),

    /*
    * Indicate if it is ACSM textbook chapters
    */
    isACSMTextbookChapters: Ember.computed('type', function(){
        return TermTaxonomy.isType(this, TermTaxonomy.ACSM_TEXTBOOK_CHAPTERS);
    }),

    /*
    * Indicate if it is ACSM textbook chapters
    */
    isActivityStatements: Ember.computed('type', function(){
        return TermTaxonomy.isType(this, TermTaxonomy.ACTIVITY_STATEMENTS);
    }),
});

/**
 * Adds convenience methods to the Question model
 */
TermTaxonomy.reopenClass({

    CLIENT_NEEDS: 'client_needs',
    NURSING_CONCEPTS: 'nursing_concepts',
    BLOOM_TAXONOMY: 'blooms',
    ACSM_TEXTBOOK_CHAPTERS: 'acsm_textbook_chapters',
	ACSM_PT_TEXTBOOK_CHAPTERS: 'acsm_pt_textbook_chapters',
    ACTIVITY_STATEMENTS: 'activity_statements',
    NURSING_CONCEPTS_ORDER : 1,
    AL_NURSING_CONCEPTS_ORDER : 2,
    TX_NURSING_CONCEPTS_ORDER : 3,

    /**
     * Gets the parent type for a term taxonomy
     * @param {Product} product
     * @param {TermTaxonomy} taxonomy
     * @returns {string}
     */
    getParentType: function(product, taxonomy){
        var parentType = null;
        var taxonomiesAllowed = product.get("termTaxonomiesAllowedForQuizzing");
        $.each(taxonomiesAllowed, function(index, taxonomyAllowed){
            var isType = TermTaxonomy.isType(taxonomy, taxonomyAllowed.key);
            if (isType){
                parentType = taxonomyAllowed.key;
            }
        });
        return parentType;
    },

    /**
     * Indicates if the term taxonomy is of the type provided
     * NOTE:
     *      this function was not part of the model definition because
     *      if was not getting initialized when term taxonomy is in a relation.
     *      i.e TermTaxonomyPerformance
     *      error: this.get(...).isType is not a function
     *
     * @param {string} type
     * @returns {boolean}
     */
    isType: function(termTaxonomy, type){
        var typeOk = termTaxonomy.get("type") === type;
        var path = termTaxonomy.get("path");

        var pathOk =  path && path.indexOf(type) > -1;
        return typeOk || pathOk;
    },

    /**
     * Filter list per type
     * @param {TermTaxonomy[]} termTaxonomies
     * @param {string} type
     * @returns {TermTaxonomy[]}
     */
    filterByType: function(termTaxonomies, type){
        return termTaxonomies.filter( function (termTaxonomy) {
            return TermTaxonomy.isType(termTaxonomy, type);
        });
    },

    /**
    * Identify if is concepts
    * @param  {string} parentName
    * @return {Bool}
    **/
    isConcepts: function(parentName){
        return (TermTaxonomy.NURSING_CONCEPTS === parentName)? true : false; //Validate if is Concepts
    },

    /**
     * Finds all term taxonomies by parent name
     * @param store
     * @param {string} parentName
     * @param {string} classId
     * @returns {[]} term taxonomies
     */
    findTermTaxonomyByParentName: function(store, parentName, classId){
        if (classId){
            return store.query("termTaxonomy", {parentName: parentName, classId: classId});
        }
        else{
            return store.query("termTaxonomy", {parentName: parentName});
        }
    },

     /**
     * Finds all term taxonomies by taxonomy tag
     * @param store
     * @param {string} taxonomyTag
     * @param {string} classId
     * @returns {[]} term taxonomies
     */
    findTermTaxonomyByTaxonomyTag: function(store, taxonomyTag, classId){
        if (classId){
            return store.query("termTaxonomy", {taxonomyTag: taxonomyTag, classId: classId});
        }
        else{
            return store.query("termTaxonomy", {taxonomyTag: taxonomyTag});
        }
    },

    /**
     * Retrieves the term taxonomy type supported by product
     * @param {Product} product
     * @returns {Array}
     */
    findTermTaxonomyTypes: function(product){
        var types = [];
        var termTaxonomiesAllowed = product.get("termTaxonomiesAllowedForQuizzing"),
            settings = product.get('settings'),
            chapterTerm = settings && settings.terminology && settings.terminology.chapter || 'chapters';

        // Turn the string into plural form and capitalize the first letter of each word
        if (chapterTerm !== 'chapters') {
            chapterTerm = Ember.String.pluralize(chapterTerm.replace(/(^| )(\w)/g, function(x) {
                return x.toUpperCase();
            }));
        } else {
            chapterTerm = I18n.t(chapterTerm, { count: 2 }).replace(/(^| )(\w)/g, function(x) {
                return x.toUpperCase();
            });
        }

        $.each(termTaxonomiesAllowed, function(index, termTaxonomyInfo){
            types.push({ name: termTaxonomyInfo.label, "id": termTaxonomyInfo.key});
        });

        types.push({ name: chapterTerm, "id": Section.NURSING_TOPICS});
        return types;
    },

    /**
     * Return structure like a Tree of term taxonomies
     * @param {TermTaxonomy[]} termTaxonomies if term taxonomies
     * @param {String} type of term taxonomy
     * @returns {Array}
     */
    convertToTree: function(termTaxonomies, type){
        var result = [];
        var firstLevel = (type) ?
            TermTaxonomy.filterByType(termTaxonomies, type) :
            termTaxonomies;

        firstLevel.forEach(function(child){
            var levelTwoMetadata = termTaxonomies.filterBy("parent", parseInt(child.get("id")));
            var isParent = levelTwoMetadata.get("length") > 0;
            if (isParent){
                var parentObj = {
                    id:child.get('id'),
                    name: child.get('name'),
                    children: levelTwoMetadata,
                    termOrder: child.get('termOrder')
                };
                if(TermTaxonomy.isConcepts(type))
                {
                    parentObj.children = parentObj.children.sortBy("name");
                    parentObj.order = parentObj.termOrder;
                }
                result.push(parentObj);
            }
        });
        return TermTaxonomy.isConcepts(type)? result.sortBy("order") : result;
    },

    /**
     * Return structure like a Tree of term taxonomies
     * @param {TermTaxonomy[]} termTaxonomies if term taxonomies
     * @returns {Array}
     */
    convertBloomsToTree: function(termTaxonomies){
        var children = TermTaxonomy.filterByType(termTaxonomies, TermTaxonomy.BLOOM_TAXONOMY);
        var result = [];
        //Blooms taxonomy has 1 level, it is different than the rest of taxonomies
        result.push({
            id: 0,
            name: "",
            children: children
        });

        return result;
    },

    /**
     * Return structure like a Tree of term taxonomies
     * @param {TermTaxonomy[]} termTaxonomies if term taxonomies
     * @returns {Array}
     */
    convertTaxonomyTagToTree: function (termTaxonomies, type) {
        var result = [], children = [];
        var firstLevel = (type) ?
            TermTaxonomy.filterByType(termTaxonomies, type) :
            termTaxonomies;

        firstLevel.forEach(function(child){
            var levelTwoMetadata = termTaxonomies.filterBy("parent", parseInt(child.get("id")));
            var isParent = levelTwoMetadata.get("length") > 0;
            if (!isParent){
                children.push(child);
            }
        });
        result.push({
            id: 0,
            name: "Nursing Concepts",
            children: children.sortBy("name")
        });

        return TermTaxonomy.isConcepts(type)? result.sortBy("order") : result;
    },

    /**
     * Return nursing concepts order
     * @param {String} nursingConcept the termTaxonomy name
     * @returns {int} order
     */
    getNursingConceptOrder: function(nursingConcept){
        if (nursingConcept === I18n.t('metadata.nursingConcepts')){
            return TermTaxonomy.NURSING_CONCEPTS_ORDER;
        }
        else if (nursingConcept === I18n.t('metadata.alabamaNursingConcepts')){
            return TermTaxonomy.AL_NURSING_CONCEPTS_ORDER;
        }
        else if (nursingConcept === I18n.t('metadata.texasNursingConcepts')){
            return TermTaxonomy.TX_NURSING_CONCEPTS_ORDER;
        }
        else{
            return 0;
        }
    }
});
