import DS from 'ember-data';
import Ember from "ember";
import ChapterFilter from "sakurai-webapp/models/chapter-filter";

export default DS.Model.extend({
    /**
     * @property {string} Filter type (e.g. 'quiz_filter')
     */
    type: DS.attr('string'),

    /**
     * @property {integer} instructor that set the filter to the chapter
     */
    instructor: DS.belongsTo('user', { async: true }),

    /**
     * @property {user} chapter for which this filter has been set
     */
    chapter: DS.belongsTo('chapter', { async: true }),

    /**
     * @property {product} product for this taxonomy
     **/
    product: DS.belongsTo('product', { async: true }),

    /**
     * Indicates if it is a practice quiz filter
     */
    isPracticeQuizFilter: Ember.computed('type', function(){
        return this.get("type") === ChapterFilter.QUIZ_FILTER;
    }),

    /**
     * Indicates if it is a hidden filter
     */
    isHiddenFilter: Ember.computed('type', function(){
        return this.get("type") === ChapterFilter.HIDDEN_FILTER;
    })

});

ChapterFilter.reopenClass({

    QUIZ_FILTER: 'quiz_filter',
    HIDDEN_FILTER: 'hidden_filter'

});
