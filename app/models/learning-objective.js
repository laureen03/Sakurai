import DS from 'ember-data';
import Ember from "ember";
import LearningObjective from "sakurai-webapp/models/learning-objective";

export default DS.Model.extend({
    /**
     * @property {string}
     */
    name: DS.attr("string"),

    /**
     * @property {SakuraiWebapp.LearningObjective}
     */
    parent: DS.belongsTo('learningObjective', { async: true, inverse: 'children' }),

    /**
     * @property {SakuraiWebapp.LearningObjective[]}
     */
    children: DS.hasMany('learningObjective', { async: true, inverse: 'parent' }),

    /**
     * @property {number}
     */
    order: DS.attr("number"),

    /**
     * @property {number} id of the subject this LO is related to
     */
    subject: DS.attr('number'),

    sections: DS.attr(),

    /**
     * Indicates if the LO has parent
     * @property {boolean}
     */
    hasParent: Ember.computed('parent', function(){
        return this.get("parent").get("content") !== null;
    }),

    childrenIds: Ember.computed('children', function(){
        return this.get("children").map(function(child){
                return child.get("id");
        });
    }),

    /**
     * Returns the list of children sorted by order
     */
    sortedChildren: Ember.computed('children', function(){
        var model = this;
        return DS.PromiseArray.create({
            promise: model.get("children").then(function(children){
                return children.sortBy("order");
            })
        });
    })

});

LearningObjective.reopenClass({

    /**
     * Returns only the parents from the list
     * @param {Ember.A} learningObjectives
     * @returns {*}
     */
    parents: function(learningObjectives){
        var filterBy = learningObjectives.filterBy("hasParent", false);
        return  filterBy.sortBy("order");
    }
});

