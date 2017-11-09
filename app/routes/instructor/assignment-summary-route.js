import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";

export default Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.get('store');
        return Ember.RSVP.hash({
            class : store.findRecord('class', params.classId),
            assignment : store.query('assignment', { assignmentId: params.assignmentId,
                                                    classId: params.classId }),
            assignmentId: params.assignmentId,
            classId: params.classId
        });
    },

    afterModel: function(model){
        var store = this.store,
            assignment = model.assignment.nextObject(0);

        if (!assignment.get("isExamAssignment")) {
            return Ember.RSVP.hash({
                product: model.class.get("product"), //preloading
                termTaxonomies: assignment.get("termTaxonomies"), //preloading
                chapters: assignment.get("chapters") //preloading
            }).then(function(hash){
                var product = hash.product;
                var isMetadataAllowed = product.get("isMetadataAllowed");
                var hasTermTaxonomy = assignment.get("hasTermTaxonomy");
                var stats = (isMetadataAllowed && hasTermTaxonomy) ? "termTaxonomyStat" : "chapterStat";

                return store.query(stats, {'assignmentId': model.assignmentId, 'classId':model.classId}).then(function(data){
                    model.stats = data;
                });
            });
        }else{
            return Ember.RSVP.hash({
                product: model.class.get("product"), //preloading
            }).then(function(){
                    return store.query('termTaxonomyStat', {
                            'assignmentId': model.assignmentId,
                            'classId':model.classId,
                            'isExam':1
                    }).then(function(data){
                        model.stats = data;
                    });
                });
        }
    },

    setupController: function(controller, model) {
        var assignment = model.assignment.nextObject(0),
            promises = [];

        controller.set('class', model.class);
        controller.set('assignment', assignment);

        controller.set('stats', model.stats ? model.stats.objectAt(0) : null);


        assignment.get("studentResults").then( function(studentResults) {
            promises.push(studentResults.map(function(studentResult){
                return studentResult.get('user');
            }));

            Ember.RSVP.all(promises).then(function () {
                controller.loadStudentResults(studentResults);
            });
        });

        var settings = model.class.get('product.settings'),
            thresholdRanges = settings.thresholdRanges;
        if (thresholdRanges) {
            controller.set('thresholdLowerLimit', thresholdRanges.barelyPassed[0]);
            controller.set('thresholdUpperLimit', thresholdRanges.barelyPassed[1]);
        } else {
            Ember.Logger.warn('thresholdRanges value not found in class.product.settings');
        }

    },

    deactivate: function() {
        var store = this.store;
        Ember.run(function() {
            var records = store.peekAll('studentResult');
            records.forEach(function(record) {
                store.unloadRecord(record);
            });
        });
        var controller = this.get('controller');
        controller.resetValues();
    }
});
