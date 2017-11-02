SakuraiWebapp.InstructorCustomizeExamRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    model: function(params) {
        var store = this.store;

        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        authenticationManager.setImpersonatedUser(false);

        var editMode = params.assignmentId !== null;

        return Ember.RSVP.hash({
                class : store.find('class', params.classId),
        });
    },


    afterModel: function(model, transition) {

    },

    /**
     * Setup controller
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
        controller.set("class", model.class);
        //controller.set('classExamOverallSettings', model.classExamOverallSettings);
    }
});
