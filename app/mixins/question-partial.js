import Ember from 'ember';
import context from 'sakurai-webapp/utils/context';
import RemediationLinkView from 'sakurai-webapp/models/remediation-link-view';

/**
 * Convenience mixing to handle actions from the question-partial.hbs
 *
 * The question-partial template is used in several application areas
 * @see SakuraiWebapp.LibraryResultsController
 * @see SakuraiWebapp.LibraryImportController
 * @see SakuraiWebapp.InstructorQcAssignmentSummaryController
 *
 * and some other controllers using this mixing
 *
 */
 export default Ember.Mixin.create({

    /**
     * Indicates the question is presented for a class
     * Default behaviour is false, this is overridden by @see SakuraiWebapp.LibraryResultsController
     * @property {bool}
     */
    classView: false,

    /**
     * Indicates if the explanation area is enabled
     * @property {bool}
     */
    explanationEnabled: true,

    /**
     * Indicates if the links area is enabled
     * @property {bool}
     */
    linksEnabled: true,

    /**
     * Indicates if the extra info area is enabled
     * @property {bool}
     */
    extraInfoEnabled: true,

    /**
     * Indicates if the term taxonomy area is enabled
     * @property {bool}
     */
    termTaxonomiesEnabled: true,


    /**
     * Indicates if the remediation links area is enabled
     * @see FeatureMixin#isRemediationLinkAllowed
     * @property {bool}
     */
    remediationLinksEnabled: Ember.computed.bool("isRemediationLinkAllowed"),

    /**
     * Indicates if the remediation links area is enabled
     * @see FeatureMixin#isReferenceLinksAllowed
     * @property {bool}
     */
    referencesEnabled: Ember.computed.bool("isReferenceLinksAllowed"),

    /**
     * Function to increment the remediation link view
     * @see QuestionPartialMixin
     */
    incRemediationLinkView: function(remediationLink){
        /*
            the class using this mixin should have a property 'canIncRemediationLinkView'
            indicating if it can inc the remediation link view
         */
        if (!this.get("canIncRemediationLinkView")){ return; }

        var store = this.store;
        var authenticationManager = context.get("authenticationManager");
        var userId = authenticationManager.getCurrentUserId();
        RemediationLinkView.incRemediationLinkViews(store, remediationLink.get("id"), userId);
    },

    actions: {

        /**
         * Action trigger in the question-partial.hbs
         * @param remediationLink
         */
        onRemediationLinkClick: function(remediationLink){
            this.incRemediationLinkView(remediationLink);
            window.open(remediationLink.get("fullUrl"));
        },

        /**
         * Action trigger in the question-partial.hbs
         * @param reference
         */
        onReferenceLinkClick: function(reference){
            window.open(reference.url);
        },

        /**
         * @see SakuraiWebapp.LibraryResultsController
         * @param question
         */
        createVariantQuestion: function(){
           Ember.Logger.warn("createVariantQuestion Not implemented");
        }
    }

});