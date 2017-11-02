SakuraiWebapp.InstructorCoInstructorRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    setupController: function(controller) {
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager'),
            user = authenticationManager.getCurrentUser();

        controller.set('instructorId', user.get('id'));
    },

    deactivate: function() {
        var controller = this.get("controller");
        controller.resetValues();
    }

});
