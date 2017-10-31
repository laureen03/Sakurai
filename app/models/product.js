import DS from 'ember-data';
import Ember from "ember";
import Product from "../models/product";
import Section from "../models/section";
import TermTaxonomy from "../models/term-taxonomy";
import Context from '../utils/context-utils';

export default DS.Model.extend({

    name: DS.attr('string'),
    title: DS.attr('string'),
    description: DS.attr('string'),
    internalClass: DS.belongsTo('class', { async: true, inverse: null }),
    settings: DS.attr(),
    publicationFacts: DS.attr(),

    /**
     * @property {number} id of the subject this product is related to
     */
    subject: DS.attr('number'),

    /**
     * method returns if metadata is allowed
     * return bool
     */
    isMetadataAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.metaDataEnabled);
        Ember.Logger.debug('isMetadataAllowed ' + allow);
        return allow;
    }),

    /**
     * method returns if ccm is allowed
     * return bool
     */
    isCCMAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.ccmEnabled);
        Ember.Logger.debug('isCCMAllowed ' + allow);
        return allow;
    }),


    /**
     * Indicates if remediation links are allowed for the product
     * @property {bool}
     */
    isRemediationLinkAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.remediationLinksEnabled);
        Ember.Logger.debug('isRemediationLinkAllowed ' + allow);
        return allow;
    }),

    /**
     * Indicates if references links are allowed for the product
     * @property {bool}
     */
    isReferenceLinksAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.referenceLinksEnabled);
        Ember.Logger.debug('isReferenceLinksAllowed ' + allow);
        return allow;
    }),

    /**
     * Get the taxonomy settings (from the product settings)
     * @return {Object}
     */
    taxonomySettings: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            taxonomySettings = (settings && settings.taxonomySettings) || {};
        Ember.Logger.debug('Taxonomy settings: ', taxonomySettings);
        return taxonomySettings;
    }),

    /**
     * Method returns the length for question on quiz
     * returns array
     */
    quizLengths: Ember.computed('settings.quizLengths', function(){
        //Default length for quiz
        var defaults = [5,10,20];
        var settings = this.get('settings');
        return (settings && settings.quizLengths) || defaults;
    }),

    /**
     * Method returns the length for question on R&R quiz
     * returns array
     */
    quizLengthsRR: Ember.computed('settings', function(){
        //Default length for quiz
        var defaults = [5,10];
        var settings = this.get('settings');
        return (settings && settings.reviewRefresh && settings.reviewRefresh.quizLengths) || defaults;
    }),

    /**
     * Method returns the length for question on exams
     * returns array
     */
    examLengths: Ember.computed('settings.examLengths', function(){
        //Default length for exam
        var defaults = [75,100,150, 200, 265];
        var settings = this.get('settings');
        return (settings && settings.examLengths) || defaults;
    }),

    /**
     * Method returns the length for question on exams
     * returns array
     */
    difficultyRangeLevels: Ember.computed('settings.difficultyRangeLevels', function(){
        //Default difficulty range values
        var defaults = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        var settings = this.get('settings');
        return (settings && settings.difficultyRangeLevels && settings.difficultyRangeLevels.length > 1) || defaults;
    }),

    /**
    * Method returns nclex proficiency thresholds for passpoint exams
    * returns array
    */

    nclexProficiencyLevels: Ember.computed('settings.nclexProficiencyLevels', function(){
        var defaults = [2, 3, 4, 5, 6, 7, 8];
        var settings = this.get('settings');
        return (settings && settings.nclexProficiencyLevels) || defaults;
    }),

    minExamLength: Ember.computed('examLengths', function(){
        return this.get('examLengths')[0];
    }),

    /**
     * method returns if product's exam is allowed
     * return bool
     */
    isExamAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.examEnabled);
        Ember.Logger.debug('isExamEnabled ' + allow);
        return allow;
    }),

    /**
     * Method returns the Times availables in minutes for exams
     * returns array
     */
    examTimeLimits: Ember.computed('settings.examTimeLimits', function(){
        //Default length for time limit for exam
        var defaults = [30,60,90,120,150,360];
        var settings = this.get('settings');
        return (settings && settings.examTimeLimits) || defaults;
    }),

    /**
     * Passing Threshold
     */
    passingThreshold: Ember.computed('settings', function(){
        var settings = this.get('settings');
        return (settings && settings.passingThreshold) ? settings.passingThreshold : 4; //default to 4
    }),

    /**
     * Chart Passing Threshold
     */
    chartPassingThreshold: Ember.computed('settings', function(){
        return this.get("passingThreshold");
    }),

    /**
     * Return the default data type from product settings
     * @property {string} sections|client_needs|nursing_concepts
     */
    defaultDataType: Ember.computed('settings', function(){
        var settings = this.get('settings');
        return (settings && settings.defaultDataType) ? settings.defaultDataType : Section.NURSING_TOPICS;
    }),

    /**
     * Return the terminology from product settings
     * @property {string} terminology
     */
    terminology: Ember.computed('settings', function(){
        var settings = this.get('settings');
        return (settings && settings.terminology && settings.terminology.chapter) ? settings.terminology.chapter : 'chapter';
    }),

    /**
     * Is Default Client Needs screen
     * @property {bool}
     */
    isDataTypeClientNeeds: Ember.computed('settings', function(){
        return this.get("defaultDataType") === 'client_needs';
    }),

    /**
     * Is Default Nursing Topics screen
     * @property {bool}
     */
    isDataTypeNursingConcepts: Ember.computed('settings', function(){
        return this.get("defaultDataType") === 'nursing_concepts';
    }),

    /**
     * Is Default Nursing Topics screen
     * @property {bool}
     */
    isDataTypeSections: Ember.computed('settings', function(){
        return this.get("defaultDataType") === 'sections';
    }),

    /**
     * Term Taxonomy allowed for quizzing
     */
    termTaxonomiesAllowedForQuizzing: Ember.computed('settings', function(){
        var taxonomySettings = this.get("taxonomySettings");
        var allowedTypes = taxonomySettings.allowedTypes || [];
        var forQuizzing = [];
        for (var i=0; i < allowedTypes.length; i++){
            if (allowedTypes[i].setting === "quiz"){
                forQuizzing.push(allowedTypes[i]);
            }
        }
        return forQuizzing;
    }),

    /**
     * Term Taxonomy Settings allowed for tagging
     * @property {Ember.A}
     */
    termTaxonomiesAllowedForTagging: Ember.computed('settings', function(){
        var taxonomySettings = this.get("taxonomySettings");
        var allowedTypes = taxonomySettings.allowedTypes || [];
        var forTagging = [];
        for (var i=0; i < allowedTypes.length; i++){
            if (allowedTypes[i].setting === "tag" || allowedTypes[i].setting === "quiz" || allowedTypes[i].setting === "admin"){
                forTagging.push(allowedTypes[i]);
            }
        }
        return forTagging;
    }),

    /**
     * method returns if Review and Refresh is active
     * return bool
     */
    isRRAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.reviewRefresh && settings.reviewRefresh.reviewRefreshEnabled);
        Ember.Logger.debug('Review and Resfresh' + allow);
        return allow;
    }),

    /**
     * method returns if Review and Refresh is active
     * return bool
     */
    reviewAndRefreshML: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.reviewRefresh && settings.reviewRefresh.reviewRefreshML);
        Ember.Logger.debug('Review and Resfresh' + allow);
        return allow;
    }),

    /**
     * method returns default Mastery Level for Review and Refresh
     * return Int
     */
    reviewRefreshML: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.reviewRefreshML);
        Ember.Logger.debug('Default Review and Refresh ML' + allow);
        return allow;
    }),

    /**
     * Indicates if client needs are allowed for tagging
     * @property {bool}
     */
    isClientNeedsAllowedForTagging: Ember.computed('termTaxonomiesAllowedForTagging.[]', function(){
        var allowed = Product.isTermTaxonomyAllowedForTagging(this, TermTaxonomy.CLIENT_NEEDS);
        Ember.Logger.debug("Product Model - clientNeedsAllowedForTagging: " + allowed);
        return   allowed;
    }),

    /**
     * Indicates if nursing concepts are allowed for tagging
     * @property {bool}
     */
    isNursingConceptsAllowedForTagging: Ember.computed('termTaxonomiesAllowedForTagging.[]', function(){
        var allowed = Product.isTermTaxonomyAllowedForTagging(this, TermTaxonomy.NURSING_CONCEPTS);
        Ember.Logger.debug("Product Model - nursingConceptsAllowedForTagging: " + allowed);
        return   allowed;
    }),

    /**
     * Indicates if client needs are allowed for quizzing
     * @property {bool}
     */
    isClientNeedsAllowedForQuizzing: Ember.computed('termTaxonomiesAllowedForQuizzing.[]', function(){
        var allowed = Product.isTermTaxonomyAllowedForQuizzing(this, TermTaxonomy.CLIENT_NEEDS);
        Ember.Logger.debug("Product Model - clientNeedsAllowedForQuizzing: " + allowed);
        return   allowed;
    }),

    /**
     * Indicates if nursing concepts are allowed for quizzing
     * @property {bool}
     */
    isNursingConceptsAllowedForQuizzing: Ember.computed('termTaxonomiesAllowedForQuizzing.[]', function(){
        var allowed = Product.isTermTaxonomyAllowedForQuizzing(this, TermTaxonomy.NURSING_CONCEPTS);
        Ember.Logger.debug("Product Model - nursingConceptsAllowedForQuizzing: " + allowed);
        return   allowed;
    }),

    /**
     * method returns if passpoint auto shutoff is enabled
     * return bool
     */
    isExamAutoShutoffAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.passpointFeatures && settings.passpointFeatures.autoShutoffEnabled);
        Ember.Logger.debug('Exam auto shutoff ' + allow);
        return allow;
    }),

    /**
     * method returns if passpoint in progress alert is enabled
     * return bool
     */
    isExamInProgressAlertAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.passpointFeatures && settings.passpointFeatures.inProgressAlertEnabled);
        Ember.Logger.debug('Exam in progress alert ' + allow);
        return allow;
    }),

    /**
     * method returns if passpoint threshold control is enabled
     * return bool
     */
    isExamThresholdControlAllowed: Ember.computed('settings', function(){
        var settings = this.get('settings'),
            allow = (settings && settings.passpointFeatures && settings.passpointFeatures.thresholdControlEnabled);
        Ember.Logger.debug('Exam threshold control ' + allow);
        return allow;
    }),

    /**
     * method returns formatted publication
     */
    formattedPublication: Ember.computed('publicationFacts', function(){
        var publicationFacts = this.get("publicationFacts");
        var formattedPublication = '';
        if(publicationFacts.authors) {
            publicationFacts.authors.forEach(function (author, index, arr) {
                if (index === arr.length - 1 && index > 0) {
                    formattedPublication += ', & ' + author.lastName + ', ' + author.firstName;
                } else if (index === 0) {
                    formattedPublication += author.lastName + ', ' + author.firstName;
                } else {
                    formattedPublication += ', ' + author.lastName + ', ' + author.firstName;
                }
            });
            formattedPublication += ', ';
        }
        formattedPublication += '<i>' + publicationFacts.title + '</i>, ';
        if(publicationFacts.editionNumber && publicationFacts.editionNumber.length) {
            formattedPublication += publicationFacts.editionNumber.replace(/[a-zA-z]+/g, "<sup>$&</sup>") + ' ed., ';
        }
        formattedPublication += publicationFacts.city + ', ';
        formattedPublication += publicationFacts.publisher + ', ';
        formattedPublication += publicationFacts.copyrightYear;
        return formattedPublication;
    }),

    toggleVersion: Ember.computed('settings', function(){
        var settings = this.get('settings'),
        toggleVersion = (settings && settings.toggleVersion) ? settings.toggleVersion : 0 ;
        return toggleVersion;
    }),
});

Product.reopenClass({

    /**
     * Returns the term taxonomy allowed by key
     * @param {Product} product
     * @param {string} key
     * @return {{}|false}
     */
    termTaxonomyAllowedByKey: function(product, key){
        var taxonomySettings = product.get("taxonomySettings");
        var allowedTypes = taxonomySettings.allowedTypes || [];
        var found = false;
        for (var i=0; i < allowedTypes.length; i++){
            if (allowedTypes[i].key === key){
                found = allowedTypes[i];
                break;
            }
        }
        return found;
    },

    /**
     * Indicates if the term taxonomy key is allowed for tagging
     * @param {Product} product
     * @param {string} key i.e client_needs, nursing_topics
     * @returns {bool}
     */
    isTermTaxonomyAllowedForTagging: function(product, key){
        var forTagging = product.get("termTaxonomiesAllowedForTagging");
        var byKey = Product.termTaxonomyAllowedByKey(product, key);
        return $.inArray(byKey, forTagging) >= 0;
    },

    /**
     * Indicates if the term taxonomy key is allowed for quizzing
     * @param {Product} product
     * @param {string} key i.e client_needs, nursing_topics
     * @returns {bool}
     */
    isTermTaxonomyAllowedForQuizzing: function(product, key){
        var forTagging = product.get("termTaxonomiesAllowedForQuizzing");
        var byKey = Product.termTaxonomyAllowedByKey(product, key);
        return $.inArray(byKey, forTagging) >= 0;
    },

    /**
     * Set R&R settings for specific product
     * @param {number} classId
     * @param {number} studentId
     * @param {number} targetMasteryLevel
     * @returns {Ember.Array} Id of disable Sections
     */
    updateReviewRefreshSettings: function (product, _key, _value){
        return new Ember.RSVP.Promise(function(resolve, reject){
            /*
             Was better Created a new ajax endpoint to avoid manipulate json settings.
             */
            var url = Context.getBaseUrl() + "/products/updateProductSettings";
            var data = { productId: product.get("id"), key: _key, value: _value };

            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: data,
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });

    }

});
