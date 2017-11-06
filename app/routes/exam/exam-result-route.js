import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';
import Assignment from 'models/assignment';

export default Route.extend(
    ResetScroll,{

    model: function (params) {
        var store = this.store;

        return Ember.RSVP.hash({
            examResult : store.query('examResult', {'examId': params.id}),
            exam : store.find('exam', params.id),
            clazz: store.find("class", params.classId),
        });
    },

    afterModel: function(model){
        var examResult = model.examResult.objectAt(0);
        return examResult.get("exam").then(function(){ //pre loading exam result dependencies
            return model.clazz.get("product"); // pre loading product
        });
    },

    setupController: function (controller, model) {
        var store = this.store;
        var authenticationManager = context.get('authenticationManager');
        var examResult = model.examResult.objectAt(0);
        var exam = model.exam;
        var assignment = (exam.get("hasAssignment"))? exam.get("assignment") : null;
        var clazz = model.clazz;
        var product = clazz.get("product");

        if (assignment){ //inc answer key views
            Assignment.incAnswerKeyViews(store, assignment.get("id"), authenticationManager.getCurrentUserId());
        }

        var settings = product.get('settings'),
            thresholdRanges = settings.thresholdRanges;

        controller.set('examResult', examResult);
        controller.set('exam', exam);
        controller.set('class', clazz);
        controller.set('assignment', assignment);
        controller.set('answerKeys', examResult.get("answerKeys"));
        controller.set('answerCurrentPage', 1);
        controller.set('assignment', assignment);

        examResult.get('answerKeys').then( function(answerKeys) {
            var answerKeysLength = answerKeys.get('length'),
                minLength = product.get('minExamLength');

            if (answerKeysLength <= minLength) {
                // Show all answers in the chart at once
                controller.set('answerPageLength', minLength);
            } else {
                // Show 50 answers per page in the chart
                controller.set('answerPageLength', 50);
            }
        });

        if (thresholdRanges) {
            assignment = controller.get("assignment");
            if (assignment && assignment.get("examMasteryThreshold")) {
                var customThresholdPassing = assignment.get("examMasteryThreshold");
                var thresholdUpperLimit = thresholdRanges.barelyPassed[1] - thresholdRanges.barelyPassed[0] + customThresholdPassing;
                controller.set('thresholdLowerLimit', customThresholdPassing);
                controller.set('thresholdUpperLimit', thresholdUpperLimit);
            } else {
                controller.set('thresholdLowerLimit', thresholdRanges.barelyPassed[0]);
                controller.set('thresholdUpperLimit', thresholdRanges.barelyPassed[1]);
            }
        } else {
            Ember.Logger.warn('thresholdRanges value not found in class.product.settings');
        }
    }
});
