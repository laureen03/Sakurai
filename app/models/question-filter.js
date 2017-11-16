import DS from 'ember-data';
import Ember from "ember";
import QuestionFilter from "sakurai-webapp/models/question-filter";

export default DS.Model.extend({

    /**
     * @property {string} Filter type (e.g. 'instructor_filter', 'private_filter', 'hidden_filter')
     */
    type: DS.attr('string'),

    /**
     * @property {integer} ID of the product the filter belongs to
     */
    product: DS.belongsTo('product', { async: true }),

    /**
     * @property {integer} ID of the instructor that set the filter to the question
     */
    instructor: DS.belongsTo('user', { async: true }),

    /**
     * @property {user} ID of the question for which this filter has been set
     */
    question: DS.belongsTo('question', { async: true }),

    resolve: Ember.computed("product", "instructor", "question", function(){
        var model = this;
        return Ember.RSVP.hash({
            "product": model.get("product"),
            "instructor": model.get("instructor"),
            "question": model.get("question")
        });
    }),

    /**
     * @property {bool}
     */
    isHidden: Ember.computed('type', function(){
        return this.get("type") === QuestionFilter.HIDDEN_FILTER;
    }),

    /**
     * @property {bool}
     */
    isPrivate: Ember.computed('type', function(){
        return this.get("type") === QuestionFilter.PRIVATE_FILTER;
    }),

    /**
     * @property {bool}
     */
    isInstructor: Ember.computed('type', function(){
        return this.get("type") === QuestionFilter.INSTRUCTOR_FILTER;
    })
});

QuestionFilter.reopenClass({

    HIDDEN_FILTER: 'hidden_filter',
    PRIVATE_FILTER: 'private_filter',
    INSTRUCTOR_FILTER: 'instructor_filter',

    createQuestionFilterRecord: function (store, data) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var questionFilter = store.createRecord("questionFilter", {
                type: data.type
            });

            Ember.RSVP.hash({
                question: store.find("question", data.questionId),
                product: store.find("product", data.productId)
            }).then(function (hash) {
                questionFilter.set("question", hash.question);
                questionFilter.set("product", hash.product);
                resolve(questionFilter);
            }, reject);
        });
    }
});