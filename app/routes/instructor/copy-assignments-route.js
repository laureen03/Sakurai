SakuraiWebapp.InstructorCopyAssignmentsRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    model: function(params) {
        var store = this.get('store');
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        authenticationManager.setImpersonatedUser(false);
        return Ember.RSVP.hash({
            assignments : store.query("assignment", {assignmentIds:params.assignmentIds}),
            class : store.find('class', params.classId),
            classExamOverallSettings: store.query('classExamOverallSetting', {classId: params.classId}),
        });
    },

    afterModel: function(model, transition) {
        return Ember.RSVP.hash({
            "product": model.class.get("product")
        }).then(function (hash) {
                model.product = hash.product;
        });
    },

    /**
     * Setup controller
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
        controller.set("class", model.class);
        var product =  model.class.get('product');
        controller.set("product", product);
        controller.loadAssignments(model.assignments);
        var classExamOverallSettings = model.class.get('classExamOverallSettings');
        controller.set('classExamOverallSettings', classExamOverallSettings);
    },

    deactivate: function(){
        var controller =  this.get("controller");
        controller.resetValues();
    }


});
