SakuraiWebapp.LoginForgotPasswordController = Ember.Controller.extend(SakuraiWebapp.ControllerMixin,{
    header: Ember.inject.controller(),

  	/* V A R  */
    /**
     * @property {boolean} indicates when the forgot password message is presented
     */
  	showMessage: false,

    /**
     * @property {string} user's email
     */
  	email: "",

    resetValues: function(){
        var controller = this;
        controller.set("showMessage", false);
        controller.set("email", "");
    },

  	/* A C T I O N S*/
  	actions: {
  		sendForgotPassword: function(){
            var controller = this;
  			if ($("#forgot-password-form").valid()){
                var email = this.get('email');
                SakuraiWebapp.User.forgotPassword(email).then(function(sent) {
                    if (sent){
                        controller.set("showMessage", true);
                    }
                });
            }
  		}
  	}
});