SakuraiWebapp.AddRemediationWebComponent = Ember.Component.extend({
	/**
     * @property {string} save question action
     */
    'data-save-action' : "addWebType",

     didInsertElement: function () {
     	var formContainer = this.$("#addWebRemediationForm");
        // validate form

        /*****************************************
		*  Set validation to Form and messages
        *******************************************/
        $.validator.addMethod(
	        "regex",
	        function(value, element, regexp) {
	            var re = new RegExp(regexp);
	            return this.optional(element) || re.test(value);
	        },
        	I18n.t('questionLibrary.createQuestions.invalidUrl')
		);

        formContainer.validate({
            ignore: 'input[type=hidden]',
            onsubmit: false,
            rules: {
                remediationName: {
                    required: true
                },
                remediationUrl: {
                    required: true,
                    //regex: "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?"
                }
            },
            messages: {
                remediationName: {
                    required: I18n.t('questionLibrary.createQuestions.errorRequired')
                },
                remediationUrl: {
                    required: I18n.t('questionLibrary.createQuestions.errorRequired')
                }
            }
        });
     },

     checkURL: function(url){
        if (!url.match(/^[a-zA-Z]+:\/\//)) {
            url = "http://" + url;
        }
        return url;
     },

     actions:{
     	addWebType: function () {
            var component = this;
            if (component.$('#addWebRemediationForm').valid()) {
                //Verify if the link have HTTP structure
                component.set("remediationUrl", component.checkURL(component.get("remediationUrl")));

	            component.sendAction(
	            	"data-save-action",
	                component.get("remediationName"),
	                component.get("remediationUrl")
	            );
	        }
        }
     }
});