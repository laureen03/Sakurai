SakuraiWebapp.IndexView = Ember.Component.extend({
	layoutName: 'layout/main',
	templateName: 'index',
	didReceiveAttrs : function(){
		//clears error messages
        $('.error').empty();

		$.validator.addMethod("regex", function(value, element) {
		      return this.optional(element) || /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
		},I18n.t('login.emailinvalidError'));


    	// validate textfield
		$("#login-form").validate({
			onsubmit: false,
			rules: {
			  	email: 'required regex',
				password: {
					required: true
				}
			},
			messages: {
			  	email: {
					required: I18n.t('login.emailRequiredError'),
					email: I18n.t('login.emailinvalidError')
				},
				password: {
					required: I18n.t('login.passRequiredError')
				}
			}
		});


  	},

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions : function() {
        this.sendAction('setMenu');
    },

});
