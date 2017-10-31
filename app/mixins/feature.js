import Ember from "ember";
import Context from '../utils/context-utils';
import TermTaxonomy from '../models/term-taxonomy';
/**
 * This mixing contains convenience methods for controlling app features
 *
 *
 */
export default Ember.Mixin.create({

    /**
     * Indicates when the ccm feature is allowed
     * The class property should exists and the product should be resolved
     * @property {bool}
     */
    isCCMAllowed: Ember.computed('class.product.isCCMAllowed', function(){
        var context = Context;
        var authenticationManager = context.get('authenticationManager');
        var clazz = this.get("class");
        var product = (clazz) ?
            clazz.get("product") : //gets product from class
            //gets product from authentication manager, only when sso and it has no classes
            authenticationManager.getCurrentProduct();

        var ccmAllowed = (product && product.get("isCCMAllowed")) || false;
        Ember.Logger.debug("Feature Mixin - ccmAllowed: " + ccmAllowed);
        return ccmAllowed;
    }),

    /**
     * Indicates when the metadata is allowed
     * The class property should exists and the product should be resolved
     * @property {bool}
     */
    isMetadataAllowed: Ember.computed('class.product.isMetadataAllowed', function(){
        var product = this.get("class").get('product');
        var metadataAllowed = product.get('isMetadataAllowed') || false;
        Ember.Logger.debug("Feature Mixin - metadataAllowed: " + metadataAllowed);
        return  metadataAllowed;
    }),

    /**
     * Indicates when the exam is allowed
     * The class property should exists and the product should be resolved
     * @property {bool}
     */
    isExamAllowed: Ember.computed('class.product.isExamAllowed', function(){
        var product = this.get("class").get('product');
        var examAllowed = product.get('isExamAllowed');
        Ember.Logger.debug("Feature Mixin - examAllowed: " + examAllowed);
        return  examAllowed;
    }),

    /**
     * Indicates when the remediation links are allowed
     * The class property should exists and the product should be resolved
     * @property {bool}
     */
    isRemediationLinkAllowed: Ember.computed('class.product.isRemediationLinkAllowed', function(){
        var product = this.get("class").get('product');
        var remediationLinkAllowed = product.get('isRemediationLinkAllowed');
        Ember.Logger.debug("Feature Mixin - remediationLinkAllowed: " + remediationLinkAllowed);
        return  remediationLinkAllowed;
    }),

    /**
     * Indicates when the remediation links are allowed
     * The class property should exists and the product should be resolved
     * @property {bool}
     */
    isReferenceLinksAllowed: Ember.computed('class.product.isReferenceLinksAllowed', function(){
        var product = this.get("class").get('product');
        var referenceLinkAllowed = product.get('isReferenceLinksAllowed');
        Ember.Logger.debug("Feature Mixin - isReferenceLinksEnabled: " + referenceLinkAllowed);
        return  referenceLinkAllowed;
    }),

    /**
    * Increment reference views
    *
    */
    incReferenceViewsAllowed: Ember.computed(function(){
        return this.showModuleByToggle("referenceViews");
    }),

    /**
     * Indicates if the default data type is any term taxonomy
     * @property {bool}
     */
    isDataTypeTermTaxonomy: Ember.computed('class.product.isDataTypeClientNeeds', 'class.product.isDataTypeNursingConcepts', function(){
        var product = this.get("class").get('product');
        var dataTypeTermTaxonomy = product.get('isDataTypeClientNeeds') ||
            product.get('isDataTypeNursingConcepts');
        Ember.Logger.debug("Feature Mixin - dataTypeTermTaxonomy: " + dataTypeTermTaxonomy);
        return   dataTypeTermTaxonomy;
    }),

    /**
     * Indicates if the client needs term taxonomy is allowed for this product
     * @property {bool}
     */
    isClientNeedsAllowedForTagging: Ember.computed('class.product.isClientNeedsAllowedForTagging', function(){
        var product = this.get("class").get('product');
        var allowed = product.get("isClientNeedsAllowedForTagging");
        Ember.Logger.debug("Feature Mixin - clientNeedsAllowedForTagging: " + allowed);
        return   allowed;
    }),

    /**
     * Indicates if the nursing concepts term taxonomy is allowed for this product
     * @property {bool}
     */
    isNursingConceptsAllowedForTagging: Ember.computed('class.product.isNursingConceptsAllowedForTagging', function(){
        var product = this.get("class").get('product');
        var allowed = product.get("isNursingConceptsAllowedForTagging");
        Ember.Logger.debug("Feature Mixin - nursingConceptsAllowedForTagging: " + allowed);
        return   allowed;
    }),

    /**
     * Indicates if the client needs term taxonomy is allowed for this product
     * @property {bool}
     */
    isClientNeedsAllowedForQuizzing: Ember.computed('stclass.product.isClientNeedsAllowedForQuizzingudentStatus', function(){
        var product = this.get("class").get('product');
        var allowed = product.get("isClientNeedsAllowedForQuizzing");
        Ember.Logger.debug("Feature Mixin - clientNeedsAllowedForQuizzing: " + allowed);
        return   allowed;
    }),

    /**
     * Indicates if the nursing concepts term taxonomy is allowed for this product
     * @property {bool}
     */
    isNursingConceptsAllowedForQuizzing: Ember.computed('class.product.isNursingConceptsAllowedForQuizzing', function(){
        var product = this.get("class").get('product');
        var allowed = product.get("isNursingConceptsAllowedForQuizzing");
        Ember.Logger.debug("Feature Mixin - nursingConceptsAllowedForQuizzing: " + allowed);
        return   allowed;
    }),

    /**
     * @property {array}
     */
    termTaxonomiesAllowedForTagging: Ember.computed('class.product.termTaxonomiesAllowedForTagging', function(){
        var product = this.get("class").get('product');
        var allowedTypes = product.get("termTaxonomiesAllowedForTagging") || [];
        var forTagging = [];
        for (var i=0; i < allowedTypes.length; i++){
            //If setting is 'admin', add it only if user is author
            if (allowedTypes[i].setting === "admin"){
                if(this.get("isAuthoringEnabled")) {
                    forTagging.push(allowedTypes[i]);
                }
            } else {
                forTagging.push(allowedTypes[i]);
            }
        }
        return forTagging;
    }),

    /**
     * @property {array}
     */
    termTaxonomiesAllowedForQuizzing: Ember.computed('class.product.termTaxonomiesAllowedForQuizzing', function(){
        var product = this.get("class").get('product');
        return product.get("termTaxonomiesAllowedForQuizzing");
    }),

    /**
     * @property {bool} indicates if has taxonomies for quizzing
     */
    hasTaxonomiesForQuizzing: Ember.computed.alias('termTaxonomiesAllowedForQuizzing.length'),

    /**
     * @property {{}} product settings
     */
    settings: Ember.computed.alias('class.product.settings'),

    /**
     * @property {Product} product info
     */
    product: Ember.computed.alias('class.product'),

    chapterTerm: Ember.computed('settings', function(){
        var settings = this.get('settings');

        return settings && settings.terminology && settings.terminology.chapter || 'chapters';
    }),

    usesChapter: Ember.computed('chapterTerm', function(){
        return this.get('chapterTerm');
    }),

    usesNursingTopics: Ember.computed('chapterTerm', function(){
        return this.get('chapterTerm') !== 'chapters';
    }),

    i18nChapterPlural: Ember.computed('chapterTerm', function(){
        return this.get('chapterTerm') + '.other';
    }),

    terminologyTermPlural: Ember.computed('chapterTerm', function(){
        return Ember.String.pluralize(this.get("chapterTerm"));
    }),

    terminologyTermSingular: Ember.computed('chapterTerm', function(){
        return Ember.String.singularize(this.get("chapterTerm"));
    }),

    context: Ember.computed(function(){
        return Context;
    }),

    user: Ember.computed.alias('context.authenticationManager.authKey.user'),

    /**
     * Indicates if authoring features are enabled
     * @property {bool}
     */
    isAuthoringEnabled: Ember.computed(function(){
        return this.get("user.isAdmin");
    }),

    /**
     * Indicates if threshold control is allowed
     * The class property should exists and the product should be resolved
     * @property {bool}
     */
    isExamThresholdControlAllowed: Ember.computed('class.product.isExamThresholdControlAllowed', function(){
        var product = this.get("class").get('product');
        var examThresholdControlAllowed = product.get('isExamThresholdControlAllowed');
        Ember.Logger.debug("Feature Mixin - examThresholdControlAllowed: " + examThresholdControlAllowed);
        return  examThresholdControlAllowed;
    }),

    /**
     * Indicates if the nursing concepts taxonomy tag is enabled for the current taxonomy type
     * @param {bool} taxonomyType
     * @return {boolean}
     */
    showModuleByToggle: function(module){
        var product = this.get("product");
        var toggleVersion = product.get("toggleVersion");
        
        if (toggleVersion === 0){
            return false;
        }
        return (Context.getToggleVersion(module) <= toggleVersion);
    },

    /**
     * Indicates if the nursing concepts taxonomy tag is enabled for the current taxonomy type
     * @param {bool} taxonomyType
     * @return {boolean}
     */
    validateTaxonomyTagConcepts: function (taxonomyType) {
        var authenticationManager = Context.get('authenticationManager');
        var taxonomyTag = authenticationManager.get("taxonomyTag");
        if (TermTaxonomy.isConcepts(taxonomyType) && (taxonomyTag)) {
            return true;
        }
        return false;
    }

});
