import DS from 'ember-data';
import Ember from "ember";
import QuestionSet from "sakurai-webapp/models/question-set";
import context from 'sakurai-webapp/utils/context';

export default DS.Model.extend({
    /**
     * @property {number} question set parent id
     */
    parentId: DS.attr('number'),

    /**
     * @property {User} Object, is the owner of parent QC
     */
    parentOwner: DS.belongsTo('user', {async: true}),

    /**
     * @property {User} Object, is the owner of QC
     */
    user: DS.belongsTo('user', {async: true}),

    /**
     * @property {Product} Object
     */
    product: DS.belongsTo('product', {async: true}),

    /**
     * @property {String} name of question Collection
     */
    name: DS.attr('string'),
    /**
     * @property {String} flag for save
     */
    mode: DS.attr('string'),

    /**
     * @property {number} total questions
     */
    totalQuestions: DS.attr('number'),

    /**
     * @property {Question[]} questions
     */
    questions: DS.hasMany('question', {async: true}),

    /**
     * @property {User[]} shared with users
     */
    sharedWith: DS.hasMany('user', {async: true}),

    /**
     * @property {boolean} indicates when the collection is enabled
     */
    enabled: DS.attr("boolean"),

    /**
     * Indicates if the question set is updated or created in the scope of a class
     * The BE will return the question set information base on this scope if present
     * @property {number} class id scope
     */
    classIdScope: DS.attr("number"),

    label: Ember.computed("totalQuestions", "name", function () {
        var name = this.get('name'),
                totalQuestions = this.get('totalQuestions');

        return name + ' ' + I18n.t('questionSet.totalQuestions', {count: totalQuestions});
    }),

    areFavorites: Ember.computed('name', function () {
        return (this.get("name").trim() === "") ? true : false;
    })

});

QuestionSet.reopenClass({

    fetch: function (questionSet) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            questionSet.reload().then(function () {
                Ember.RSVP.hash({
                    "questions": questionSet.get("questions"),
                    "user": questionSet.get("user"),
                    "product": questionSet.get("product")
                })
                        .then(function () {
                            resolve(questionSet);
                        }, reject);
            }, reject);
        });
    },

    /*
     * Ajax call, for remove, add question, change order
     */
    updateQuestionSet: function (params) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var url = Context.getBaseUrl() + "/questionSets/updateElement";

            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: params,
                dataType: 'json'
            }).then(function (response) {
                return resolve(response.data);
            },
                    reject);
        });
    },

    /*
     * Ajax call, for sharing question set
     */
    shareQuestionSet: function (_questionSetId, _instructorIds) {
        var params = {questionSetId: _questionSetId, instructorIds: _instructorIds};

        return new Ember.RSVP.Promise(function (resolve, reject) {
            var url = Context.getBaseUrl() + "/questionSets/shareQuestionSet";

            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: params,
                dataType: 'json'
            }).then(function (response) {
                return resolve(response.data);
            },
                    reject);
        });
    },

    /*
     * Add question to Question collection
     */
    addQuestionToQC: function (_questionSetId, _questionId, _index) {
        var self = this;
        var data = {action: 'add', questionSetId: _questionSetId, questionId: _questionId, index: _index};
        return self.updateQuestionSet(data);
    },

    /*
     * Remove question from Question Collection
     */
    removeQuestionFromQC: function (_questionSetId, _questionId) {
        var self = this;
        var data = {action: 'remove', questionSetId: _questionSetId, questionId: _questionId};
        return self.updateQuestionSet(data);
    },

    /*
     * Change position in the question collection list
     */
    changeOrderOfQuestion: function (_questionSetId, _questionId, _index) {
        var self = this;
        var data = {action: 'updateOrder', questionSetId: _questionSetId, questionId: _questionId, index: _index};
        return self.updateQuestionSet(data);
    }

});
