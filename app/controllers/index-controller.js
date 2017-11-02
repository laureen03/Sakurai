SakuraiWebapp.IndexController = Ember.Controller.extend(SakuraiWebapp.ControllerMixin, SakuraiWebapp.LoginMixin,{
	/* V A R */
    header: Ember.inject.controller(),

	/**
	* @property {boolean} indicates whether or not to display the login error
	*/
	errorLogin: false,

	/**
	* @property {string} indicates the publisher Name the user selected
	*/
	publisherName: "LWW",

	/**
	* @property {string} user's email
	*/
	email: "",

	/**
	* @property {string} user's password
	*/
	password: "",

	/**
	* Authenticate with the controller data
	*/
	_authenticate: function(){
		var controller = this;
		var store = controller.store;
		var context = SakuraiWebapp.context;
		var authenticationManager = context.get('authenticationManager');

		var publisherName = controller.get("publisherName");
		var email = controller.get('email');
		var password = controller.get('password');

		var promise = authenticationManager.authenticate(store, email, password, publisherName);

		promise.then(function(authenticated){
			if(authenticated){
				var metadata = controller.store._metadataFor("authKey");
				controller.afterAuthenticate(metadata.totalClasses, metadata.classes);
			}
			else{
				controller.set("errorLogin", true);
			}
		},function(reason) {
			controller.set("errorLogin", true);
		});
	},


	/* A C T I O N S */
	actions: {
		/**
		* Login action
		*/
		login: function(){
			var controller = this;
			if ($("#login-form").valid())
			{
				controller._authenticate();
			}
			controller.set("errorLogin", false);
		},

        setMenu: function(){
            this.get('header').set("menu", "menu-home");
        }
	}
});
