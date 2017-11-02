SakuraiWebapp.StudentEnrollRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    setupController: function(controller, model) {
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var user = authenticationManager.getCurrentUser();
        controller.setDefaultValues(user.get('id'));
    },

    deactivate: function() {
        var controller = this.get("controller");
        controller.resetValues();
    }

});