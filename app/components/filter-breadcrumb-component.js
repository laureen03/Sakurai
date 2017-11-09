/**
 *
 * This component is used in the question library to show the chapters or
 *  taxonomies selected to filter questions
 * @type {FilterBreadcrumbComponent}
 */
import Ember from "ember"; 
import TermTaxonomy from "models/term-taxonomy";

export default Ember.Component.extend({

    /**
     * @property {{name: <string literal | i18n key>, type: "a type"}}
     * The value of 'data-i18n-names' determines whether the data filter name
     * is a string literal or an i18n key
     */
    'data-filters':null,

    /**
     * @property {string} type
     */
    'data-type': null,

    /**
     * @property {bool} indicates if the data should be filter by type
     */
    'data-filter-type': false,

    /**
     * @property {bool} indicates if the names are i18n keys
     */
    'data-i18n-names': false,

    /**
     * @property {string} title label
     */
    'data-title': null,

    /**
     * @property {string} i18n key for title label
     */
    'data-title-i18n': null,

    /**
     * @property {string} remove action
     */
    'data-remove-action': null,

    /**
     * @property {bool} indicates if the filter is for Users
     */
    'data-is-user': null,

    /**
     * Return strengths per type
     * @property {TermTaxonomy[]|Chapter[]}
     */
    filters: Ember.computed("data-filters.[]", "data-type", function(){ 
        var type = this.get("data-type");
        return (this.get("data-filter-type")) ? //filtering is only for taxonomies
            TermTaxonomy.filterByType(this.get("data-filters"), type) :
            this.get("data-filters");
    }),

    /**
     * Indicates if there are filters to apply
     * @property {bool}
     */
    hasFilters: Ember.computed("filters.[]", function(){  
        return this.get("filters").get("length") > 0;
    }),

    /**
     * @property {string} title label
     */
    title: Ember.computed("data-title", "data-title-i18n", function(){
        var i18n = this.get("data-title-i18n");

        return (i18n) ? I18n.t(i18n) : this.get("data-title");
    }),

    actions:{
        removeFilter: function(type){
            this.sendAction('data-remove-action', type);
        }
    }

});
