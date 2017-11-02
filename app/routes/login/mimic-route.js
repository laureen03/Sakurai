SakuraiWebapp.LoginMimicRoute = Ember.Route.extend({

    //does mimic user
    model: function(params) {
        return Ember.RSVP.hash({
            authKey: SakuraiWebapp.AuthKey.mimic(this.store, params.refresh_token, params.publisher_name),
            params: params
        });
    },

    //loads some more data for handling the sso request
    afterModel: function(model){
        var authKey = model.authKey;
        var context = SakuraiWebapp.context;
        var manager = context.get('authenticationManager');
        return manager._authenticate(authKey, { mimic : true });
    },

    setupController: function(controller, model) {
        var context = SakuraiWebapp.context;
        var manager = context.get('authenticationManager');
        if (manager.isAuthenticated()){
            var metadata = controller.store._metadataFor("authKey");
            controller.afterAuthenticate(metadata.totalClasses, metadata.classes);
        }
        else{
            //TODO ??
            alert("Invalid token");
        }
    },

    deactivate: function () {
        var controller = this.get('controller');
        controller.set("refresh_token", null);
    }
});
