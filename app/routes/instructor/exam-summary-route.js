import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
    ResetScroll,{
    model: function(params) {
        var store = this.store,
            userId;

        //clears impersonated
        var authenticationManager = context.get('authenticationManager'),
            classPromise = store.find("class", params.classId);

        authenticationManager.setImpersonatedUser(false);

        userId = authenticationManager.getActiveUserId();

        return Ember.RSVP.hash({
            class : classPromise,
            studentUsage : store.query("studentUsage", { classId: params.classId, isExam: 1 }),
            product : classPromise.then( function(clazz) {
                return clazz.get('product');
            })
        });
    },


    setupController: function(controller, model) {
        var settings = model.product.get('settings'),
            thresholdRanges = settings.thresholdRanges;

        controller.set("class", model.class);
        controller.set("studentUsage", model.studentUsage);
        controller.initStudentUsage(model.studentUsage);

        var studentUsageMetadata = model.studentUsage.get('meta');
        controller.set("classAverageMasteryLevel", studentUsageMetadata.classAverageMasteryLevel);

        if (thresholdRanges) {
            controller.set('thresholdLowerLimit', thresholdRanges.barelyPassed[0]);
            controller.set('thresholdUpperLimit', thresholdRanges.barelyPassed[1]);
        } else {
            Ember.Logger.warn('thresholdRanges value not found in class.product.settings');
        }

        this.lazyLoad(controller, model);

    },

    lazyLoad: function(controller, model) {

        var store = this.store,
            classId = model.class.get("id"),
            authenticationManager = context.get('authenticationManager'),
            taxonomyTag = authenticationManager.get("taxonomyTag");    //Check if taxonomy tag exist

        store.query("examAssignmentResult", {classId: classId}) //load Exam Assignment Result
            .then(function(examAssignmentResults){ //display class usage
                //init Exam Assignment Results
                controller.initExamAssignmentResults(examAssignmentResults);
                return store.query("termTaxonomyStat", { classId:classId, isExam: 1, taxonomyTag: taxonomyTag}); // next Load Term Taxonomy
            })
            .then(function(termTaxonomyStats){ //display assignments
                //Init Term Taxonomy Stats
                controller.initTermTaxonomyStat(termTaxonomyStats.nextObject(0));
                return store.query("chapterStat", { classId:classId, isExam: 1 }); //Next Load Chapter Stats
            })
            .then(function(chapterStats){ // displays misconceptions
                //Init Chapter Stats
                controller.initChapterStat(chapterStats.nextObject(0));
            });
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }

});
