
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';
import Assignment from "sakurai-webapp/models/assignment";

export default Ember.Route.extend(
    ResetScroll,{

    model: function (params) {
        var authenticationManager = context.get('authenticationManager'),
            store = this.store;

        var quizType = (params.isReviewRefresh) ? "reviewRefreshQuiz" : "quiz";
        var records = store.peekAll('quiz');
        records.forEach(function(record) {
          store.unloadRecord(record);
        });
        return new Ember.RSVP.Promise(function(resolve, reject){
            store.query('quizResult', {'quizId': params.id, "isReviewRefresh": params.isReviewRefresh}).then( function(quizResult) {
                    quizResult.objectAt(0).get(quizType).then( function(quiz) {

                        Ember.RSVP.hash({
                            quizResult: quizResult,
                            assignment: quiz.get("assignment"),
                            quizId : params.id,
                            classId: params.classId,
                            userId : authenticationManager.getActiveUserId(),
                            class: store.find("class", params.classId),
                            quiz: quiz,
                            isReviewRefresh: params.isReviewRefresh,
                        }).then(resolve, reject);
                }, reject);
            }, reject);
        });
    },

    afterModel: function(model) {
        var store = this.store;
        var assignment = model.assignment;
        var userId = model.userId;

        var isQC = assignment && assignment.get("isQuestionCollectionAssignment");
        var quiz = model.quiz;

        return Ember.RSVP.hash({
            product: model.class.get("product"), //preloading
            termTaxonomies: quiz.get("termTaxonomies"), //preloading
            chapters: quiz.get("chapters") //preloading
        }).then(function(hash){
            var product = hash.product;
            var isMetadataAllowed = product.get("isMetadataAllowed");
            var hasTermTaxonomies = quiz.get("hasTermTaxonomies");
            var stats = (isMetadataAllowed && hasTermTaxonomies) ? "termTaxonomyStat" : "chapterStat";

            if(isQC) {
                var authenticationManager = context.get('authenticationManager');
                var isImpersonated = authenticationManager.get('isImpersonated');
                if(!isImpersonated){
                    return Assignment.incAnswerKeyViews(store, assignment.get("id"), userId);
                }
            } else {
                return store.query(stats, {'quizId': model.quizId, "classId": model.classId, "isReviewRefresh": model.isReviewRefresh}).then(function(data){
                    model.stats = data;
                });
            }
        });
    },

    setupController: function (controller, model) {
        controller.set('quizResult', model.quizResult.objectAt(0));
        controller.set('quiz', model.quiz);
        controller.set('class', model.class);
        controller.set('assignment', model.assignment);
        controller.set('stats', model.stats ? model.stats.objectAt(0) : null);
        controller.set("studentId", model.userId);
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.set('quizHistory', false);
        controller.set('isReviewRefresh', false);
        controller.set('showQuizzes', false);
        controller.set('quizzesML', null);
    }

});
