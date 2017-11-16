
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.store;
        var authenticationManager = context.get('authenticationManager');
        if (params.studentId){ //impersonates the user
            authenticationManager.setImpersonatedUser(params.studentId);
        }

        var userId = authenticationManager.getActiveUserId();
        
        return Ember.RSVP.hash({
            overallPerformance : store.query("overallPerformance", {studentId:userId, classId:params.classId}),
            chapterStats : this.store.query("chapterStat", {studentId:userId, classId:params.classId }),
            assignmentsStats : this.store.query("assignmentStat", {studentId:userId, classId:params.classId }),
            class : store.find("class", params.classId),
            userId : userId
        });
    },

    afterModel: function(model) {
        var store = this.store;
        var userId = model.userId;

        var productPromise = model.class.get("product");

        return productPromise.then(function(product){
            var isMetadataAllowed = product.get("isMetadataAllowed");

            var authenticationManager = context.get('authenticationManager');
            //Check if taxonomy tag exist
            var taxonomyTag = authenticationManager.get("taxonomyTag");
            
            return !isMetadataAllowed ? null :
                store.query("termTaxonomyStat", {studentId:userId, classId:model.class.get("id"), taxonomyTag: taxonomyTag}).then(function(data){
                    model.termTaxonomyStats = data;
                });
        });
    },

    setupController: function(controller, model) {
        var product = model.class.get("product");
        controller.set("product", product);
        controller.set("class", model.class);
        controller.set("chapterStats", model.chapterStats.nextObject(0));
        controller.set("assignmentStats", model.assignmentsStats.nextObject(0));
        controller.set("overallPerformance", model.overallPerformance.nextObject(0));
        if (product.get("isMetadataAllowed")){
            controller.set("termTaxonomyStats", model.termTaxonomyStats.nextObject(0));
        }

        controller.defaultReviewRefreshClassSetting(product, model.class);
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }

});