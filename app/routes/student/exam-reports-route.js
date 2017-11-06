import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.store,
            authenticationManager = context.get('authenticationManager');

        if (params.studentId){ //impersonates the user
            authenticationManager.setImpersonatedUser(params.studentId);
        }

        var userId = authenticationManager.getActiveUserId();
        //Check if taxonomy tag exist
        var taxonomyTag = authenticationManager.get("taxonomyTag");

        return Ember.RSVP.hash({
            class : store.find("class", params.classId),
            examStats : store.query("examStat", { classId:params.classId, studentId: userId }),
            termTaxonomyStats : store.query("termTaxonomyStat", { classId:params.classId, studentId: userId, isExam: 1, taxonomyTag: taxonomyTag}),
            chapterStats : store.query("chapterStat", { classId:params.classId, studentId:userId, isExam: 1 })
        });
    },

    afterModel: function(model){
        var examStat = model.examStats.nextObject(0);
        return Ember.RSVP.hash({
            "product": model.class.get('product'), //preloading product
            "exams" : examStat.get("exams") //preloading exams
        });
    },

    setupController: function(controller, model) {
        var product = model.class.get("product");

        var settings = product.get('settings'),
            thresholdRanges = settings.thresholdRanges;

        controller.set("class", model.class);
        controller.set("examStat", model.examStats.nextObject(0));
        controller.set("termTaxonomyStat", model.termTaxonomyStats.nextObject(0));
        controller.set("chapterStat", model.chapterStats.nextObject(0));

        if (thresholdRanges) {
            var examStat = controller.get("examStat");
            if (examStat && examStat.get("customThresholdPassing")) {
                var customThresholdPassing = examStat.get("customThresholdPassing");
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
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }

});
