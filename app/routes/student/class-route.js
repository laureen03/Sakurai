SakuraiWebapp.StudentClassRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    setupController: function(controller, model) {
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var publisher = authenticationManager.getCurrentPublisher();
        var user = authenticationManager.getCurrentUser();
        controller.setDefaultValues(user.get('id'), publisher.get('id'));
    }

});