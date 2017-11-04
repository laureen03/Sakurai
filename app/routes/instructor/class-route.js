SakuraiWebapp.InstructorClassRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    setupController: function(controller, model) {
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        authenticationManager.clearCurrentClass(); //removing the current class for instructors
    }

});