import DS from 'ember-data';
import Section from "../models/section";

export default DS.Model.extend({
    name: DS.attr("string"),
    order: DS.attr("number"),
    description: DS.attr("string"),
    trialAllowed: DS.attr("boolean"),
    isLive: DS.attr("boolean"),
    product: DS.belongsTo('product', { async: true }),
    children: DS.hasMany('chapter', { async: true }),
    externalId: DS.attr("number"),

    /**
     * @property {string} section isbn
     */
    isbn: DS.attr("string"),

    /**
     * Finds for the chapters based on the ids provided
     * @param {number[]} ids
     * @returns {Chapter[]}
     */
    findChaptersByIds: function (ids) {
        var model = this;
        var chapters = [];
        $.each(ids, function (index, id) {
            var children = model.get("children");
            var chapter = children.filterBy("id", id);
            if (chapter.length > 0) {
                chapters.push(chapter.get('firstObject'));
            }
        });
        return chapters;
    }


});

/**
 * Adds convenience methods to the Section model
 */
Section.reopenClass({
    NURSING_TOPICS: 'nursing_topics'
});
