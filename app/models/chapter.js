/**
 * This class exists because ember doesn't support sideloaded of the same model class
 * i.e
 *
 * Section {
 *  children: DS.hasMany('section', { async: true })
 * }
 *
 * the rootKey will be "sections" and the sideloaded will be "sections" as well
 *
 * This Chapter is a Section class
 * @type {*}
 */
import DS from 'ember-data';
import Ember from "ember";

export default DS.Model.extend({
    name: DS.attr("string"),
    order: DS.attr("number"),
    description: DS.attr("string"),
    trialAllowed: DS.attr("boolean"),
    isLive: DS.attr("boolean"),
    product: DS.belongsTo('product', { async: true }),
    externalId: DS.attr("number"),

    /**
     * This property is not loaded from the api,
     * it is only used when creating an assignment, so the parent name
     * can be displayed at the confirmation page
     * @property {string} parent name
     */
    parentName: null,

    /**
     * @property {ChapterFilter[]} array of chapter filter IDs
     */
    chapterFilters: DS.hasMany('chapterFilter', { async: true }),

    /**
     * @property {string} chapter isbn
     */
    isbn: DS.attr("string"),


    /**
     * Indicates if this chapter should be hidden from practice quizzes
     */
    isHiddenFromPracticeQuiz: Ember.computed('chapterFilters.[]', function(){
        var filters = this.get("chapterFilters");
        var hidden = false;
        filters.forEach(function(filter){
            if (filter.get("isPracticeQuizFilter") || filter.get("isHiddenFilter")) {
                hidden = true;
            }
        });
        return hidden;
    }),

    /**
     * Indicates if this chapter filter was created by Admin user
     */
    hasHiddenFilter: Ember.computed('chapterFilters.[]', function(){
        var filters = this.get("chapterFilters");
        return filters.filterBy('isHiddenFilter').length;
    })
});

