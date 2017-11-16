
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";

export default Ember.Route.extend(
    ResetScroll,{

    getSourceQuestionSet: function (params, transition) {
        var store = this.store;

        return new Ember.RSVP.Promise(function(resolve){

            store.find("class", params.classId).then(function(clazz){

                clazz.get("product").then(function(product){

                    store.query("questionSet", { productId: product.get('id'),
                                                questionSetId: params.qsSource }).then( function( questionSets ) {
                        var questionSet;

                        if (questionSets.get('length')) {
                            questionSet = questionSets.objectAt(0);
                            questionSet.get('questions').then( function( questions ) {
                                resolve( Ember.Object.create({
                                    questionSet: questionSet,
                                    questions: questions
                                }));
                            });
                        } else {
                            resolve( Ember.Object.create({
                                questionSet: null
                            }));
                        }
                    });
                });
            }, function(reason) {
                transition.send('error', { reason: reason });
                // Send the error and resolve the promise so it always succeeds
                // The afterModel hook will determine if the resolved values are valid
                resolve( Ember.Object.create({
                    questionSet: null
                }));
            });
        });
    },

    getTargetQuestionSet: function (params, transition) {
        return this.store.findById("questionSet", params.qsTarget).then( function( questionSet ) {

            // The record for the target question set is first loaded when requesting the records for
            // all the question sets (/questionSets?userId=<user_id>&productId=<prod_id>) -for the
            // left menu. However, these records do not include any question information. To add the
            // question information to the record, the question set is reloaded.
            return questionSet.reload().then( function(questionSet) {
                // The questions of the target question will be set to a promise
                return Ember.Object.create({
                    questionSet: questionSet,
                    questions: questionSet.get('questions')
                });
            });
        }, function (reason) {
            // Send the error and continue with the flow
            transition.send('error', { reason: reason });
            return Ember.Object.create({
                questionSet: null
            });
        });
    },

    model: function (params, transition) {
        var source = this.getSourceQuestionSet(params, transition),
            target = this.getTargetQuestionSet(params, transition);

        return Ember.RSVP.hash({
            params: params,
            source: source,
            target: target
        });
    },

    afterModel: function (model) {

        // To complete the transition, both source and target question sets must exist
        if (!model.target.questionSet) {
            // If the target doesn't exist, redirect to library.home
            this.transitionTo('library.home', model.params.classId);
        }
        if (!model.source.questionSet) {
            // If the source doesn't exist, redirect to library.results
            this.transitionTo('library.results', model.params.classId, { queryParams: { qsId: model.params.qsTarget} });
        }
    },

    setupController: function (controller, model) {
        controller.set('sourceQuestionSet', model.source);
        controller.set('targetQuestionSet', model.target);
    },

    resetController: function (controller, isExiting) {
        if (isExiting) {
            controller.set("sourceQuestionSet", null);
            controller.set("targetQuestionSet", null);
        }
    }

});
