SakuraiWebapp.LoginForgotPasswordView = Ember.Component.extend({
	layoutName: 'layout/main',
	templateName: 'login/forgot_password',

	didInsertElement : function(){
	    this._super();
	    Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
  	},

  	afterRenderEvent : function(){

        //clears error messages
        $('.error').empty();

        $.validator.addMethod("regex", function(value, element) {
            return this.optional(element) || /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
        },I18n.t('login.emailinvalidError'));

        // validate textfield
        $("#forgot-password-form").validate({
            onsubmit: false,
            rules: {
                email: 'required regex'

            },
            messages: {
                email: {
                    required: I18n.t('login.emailRequiredError'),
                    email: I18n.t('login.emailinvalidError')
                }
            }
        });
    }
});
