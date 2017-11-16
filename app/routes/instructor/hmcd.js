
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';
import Question from 'sakurai-webapp/models/question';

export default Ember.Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.store;

        //clears impersonated user
        var authenticationManager = context.get('authenticationManager');
        authenticationManager.setImpersonatedUser(false);
        authenticationManager.setCurrentClass(params.classId); //tracks the current class for instructors

        var model = {};
        return Ember.RSVP.hash({
            class: store.find("class", params.classId),
            overallPerformance: store.query("overallPerformance", {classId: params.classId}),
            studentUsage : store.query("studentUsage", { classId: params.classId })
        }).then(function(hash){ //load product
            model.class = hash.class;
            model.overallPerformance = hash.overallPerformance;
            model.studentUsage = hash.studentUsage;
            return hash.class.get("product");
        }).then(function(product){ //return model
            model.product = product;
            return model;
        });
    },

    setupController: function(controller, model) {
        //var metadata = store.metadataFor("classUsage");
        controller.set("class", model.class);
        controller.set("classId", model.class.get("id"));
        //Init Class Performance
        controller.initClassPerformance(model.overallPerformance.nextObject(0), model.studentUsage);
        //Init Student Usage
        controller.initStudentUsage(model.studentUsage);
        controller.defaultReviewRefreshClassSetting(model.product, model.class);
        this.lazyLoad(controller, model);
    },


    lazyLoad: function(controller, model) {

        var store = this.store,
            product = model.product,
            classId = model.class.get("id");

        store.query("classUsage", { classId: classId }) //load class usage
            .then(function(classUsage){ //display class usage
                //Init Overall Usage
                //var metadata = store.metadataFor("classUsage");
                var metadata = classUsage.get("meta");
                controller.initOverallUsage(metadata, classUsage);

                return store.query("assignment", {classId: classId}); // next load assignments
            })
            .then(function(assignments){ //display assignments
                //Init QC Assignment Results
                controller.initQcAssignmentResults(assignments);
                return store.query("chapterStat", {classId: classId}); // next load chapter stats
            })
            .then(function(chapterStats){
                var isMetadataAllowed = product.get("isMetadataAllowed");
                var taxonomySettings = product.get("taxonomySettings");
                var authenticationManager = context.get('authenticationManager');
                //Check if taxonomy tag exist
                var taxonomyTag = authenticationManager.get("taxonomyTag");
                if (isMetadataAllowed){
                    return store.query("termTaxonomyStat", {classId: classId, taxonomyTag: taxonomyTag }).then(function(termTaxonomyStats){
                        //Init Strength and Weaknesses
                        controller.initStrengthsWeaknesses(taxonomySettings, chapterStats.nextObject(0), termTaxonomyStats);
                        return Question.getClassMisconceptions(store, classId, product.get("id")); // next load misconceptions
                    });
                }
                else{
                    controller.initStrengthsWeaknesses(taxonomySettings, chapterStats.nextObject(0), null);
                    return Question.getClassMisconceptions(store, classId, product.get("id")); // next load misconceptions
                }

            }).
            then(function(classMisconceptions){ // displays misconceptions
                //Init Misconceptions
                controller.initMisconceptions(classMisconceptions);
            });

    },

    deactivate: function(){
        var controller =  this.get("controller");
        controller.resetValues();
    }


});
