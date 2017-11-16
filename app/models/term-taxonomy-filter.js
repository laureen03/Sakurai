import DS from 'ember-data';
import Ember from "ember";
import TermTaxonomyFilter from "sakurai-webapp/models/term-taxonomy-filter";

export default DS.Model.extend({

    /**
     * @property {string} Filter type (e.g. 'quiz_filter')
     */
    type: DS.attr('string'),

    /**
     * @property {integer} instructor that set the filter to the Term Taxonomy
     */
    instructor: DS.belongsTo('user', { async: true }),

    /**
     * @property {user} Term Taxonomy for which this filter has been set
     */
    termTaxonomy: DS.belongsTo('termTaxonomy', { async: true }),

    /**
    * @property {product} product for this taxonomy
    **/
    product: DS.belongsTo('product', { async: true }),

    /**
     * Indicates if it is a practice quiz filter
     */
    isPracticeQuizFilter: Ember.computed('type', function(){
        return this.get("type") === TermTaxonomyFilter.QUIZ_FILTER;
    }),

    /**
     * Indicates if it is a hidden filter
     */
    isHiddenFilter: Ember.computed('type', function(){
        return this.get("type") === TermTaxonomyFilter.HIDDEN_FILTER;
    })

});

TermTaxonomyFilter.reopenClass({
    QUIZ_FILTER: 'quiz_filter',
    HIDDEN_FILTER: 'hidden_filter'

});
