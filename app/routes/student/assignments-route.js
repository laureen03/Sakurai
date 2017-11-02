SakuraiWebapp.StudentAssignmentsRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
    model: function(params) {
        var store = this.store;
        
        var userId;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        userId = authenticationManager.getActiveUserId();
       
        return Ember.RSVP.hash({
            assignments : store.query("assignment", {classId:params.classId,studentId: userId}),
            class : store.find("class", params.classId)
        });
    },

    setupController: function(controller, model) {
        controller.set("product", model.class.get("product"));
        controller.set("class", model.class);
        controller.loadAssignments(model.assignments);
    }

});