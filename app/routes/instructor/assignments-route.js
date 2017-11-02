SakuraiWebapp.InstructorAssignmentsRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
    model: function(params) {
        var store = this.store;

            var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
            var user = authenticationManager.getCurrentUser();
                userId = user.get("id");
            
            return Ember.RSVP.hash({
                assignments : store.query("assignment", {classId:params.classId, instructorId:userId}),
                product : store.find("product", params.productId),
                class : store.find('class', params.classId),
                classId : params.classId
            });
    },

    setupController: function(controller, model) {
        controller.set("product", model.product);
        controller.set('classId', model.classId);
        controller.set("class", model.class);
        controller.loadAssignments(model.assignments);
    },

    deactivate: function() {
        var controller = this.get("controller");
        controller.resetValues();
    }
});
