import Ember from 'ember';

export default Ember.Mixin.create({

    fieldsHidden: true,

    hasAttemptedSave: false,

    updateAction: "update",

    actionHidden: Ember.computed('fieldsHidden', function(){
        return !this.get('fieldsHidden');
    }),

    initFormValidation: function() {
        var formName = $('#update-name'),
            self = this;

        $.validator.addMethod("alphaNumberDashAndApostrophe", function(value) {
            var formatOk = /^[a-z0-9\-']+$/i.test(value.trim());
            return (self.get('hasAttemptedSave')) ? formatOk : true;
        }, I18n.t('error.invalidChars'));

        $.validator.addMethod("atLeastOneUpperCaseLetter", function(value) {
            return (self.get('hasAttemptedSave')) ? /^.*(?=.*[A-Z]).*$/.test(value) : true;
        });

        $.validator.addMethod("atLeastOneLowerCaseLetter", function(value) {
            return (self.get('hasAttemptedSave')) ? /^.*(?=.*[a-z]).*$/.test(value) : true;
        });

        Ember.Logger.debug(this.toString() +': set up validation for form with name fields');

        formName.validate({
            onsubmit: false,
            rules: {
                firstName: {
                    required: true,
                    alphaNumberDashAndApostrophe: true
                },
                lastName: {
                    required: true,
                    alphaNumberDashAndApostrophe: true
                }
            }
        });
    },

    viewUpdateFail: function (errorCode) {
        var submitButton = $('#profile-submit'),
            errorMessage = I18n.t('profile.messages.updateFail'),
            $el, text;

        Ember.Logger.debug(this.toString() + ': handle failure to update. Error code:', errorCode);

        if (errorCode === 'invalid_password') {
            $el = $('#password');
            text = I18n.t('profile.messages.invalidPassword');
            this.setManualError($el, text, 'invalid-password');
        }

        // Show notification
        toastr.error(errorMessage);

        // Re-enable the submit button
        submitButton.removeAttr('disabled');
    },

    viewUpdateSuccess: function (nameOnly) {

        var submitButton = $('#profile-submit'),
            successMessage = (nameOnly) ? I18n.t('profile.messages.updateNameSuccess') :
                                          I18n.t('profile.messages.updatePasswordSuccess');

        Ember.Logger.debug(this.toString() + ': profile updated successfully');

        // Show notification
        toastr.success(successMessage);

        // Re-enable the submit button
        submitButton.removeAttr('disabled');
    },

    setManualError: function ($element, labelText, errorClass) {
        var errorEl = $('<label class="manual-error error"></label>');

        errorEl.text(labelText)
               .addClass(errorClass);

        $element.one('focus', function() {
            var $this = $(this),
                errorSelector = '.manual-error.' + errorClass;

            // On focus, remove the error outline and the error message
            $this.removeClass('error');
            $(errorSelector, $this.parent()).remove();
        });

        $element.addClass('error')
                .parent().append(errorEl);
    },

    resetManualErrors: function() {
        // Only need the form password because we're currently only
        // setting manual errors there
        var formPassword = $('#update-password');

        // Remove error outline and event handlers
        formPassword.find('input').off('focus')
                                  .removeClass('error');

        // Remove error messages not handled by $.validator
        $('label.manual-error', formPassword).remove();
    },

    actions: {

        cancelProfileUpdate: function() {
            var formPassword = $('#update-password'),
                validator = formPassword.validate();

            validator.resetForm();
            this.resetManualErrors();

            this.set('fieldsHidden', true);
            this.set('hasAttemptedSave', false);
            this.resetValues();
        },

        showPasswordFields: function() {
            var formPassword = $('#update-password');

            this.set('fieldsHidden', !this.get('fieldsHidden'));

            Ember.Logger.debug(this.toString() +': set up validation for form with password fields');

            formPassword.validate({
                onsubmit: false,
                rules: {
                    password: {
                        required: true
                    },
                    newPassword: {
                        required: true,
                        minlength: 6,
                        atLeastOneUpperCaseLetter: true,
                        atLeastOneLowerCaseLetter: true
                    },
                    retypePassword: {
                        required: true,
                        equalTo: '#newPassword'
                    }
                },
                messages: {
                    newPassword: {
                        minlength: I18n.t('error.length.passwordMin'),
                        atLeastOneUpperCaseLetter: I18n.t('error.password.upperCaseLetter'),
                        atLeastOneLowerCaseLetter: I18n.t('error.password.lowerCaseLetter')
                    },
                    retypePassword: {
                        equalTo: I18n.t('error.password.match')
                    }
                }
            });
        },

        validate: function() {
            var formName = $('#update-name'),
                formPassword = $('#update-password'),
                passwordFieldsHidden = this.get('fieldsHidden'),
                submitButton = $('#profile-submit'),
                self = this;

            // Disable submit button during validation to avoid multiple submissions
            submitButton.attr('disabled', true);

            // Do not let the validation of fields start until we have clicked on the
            // save button
            this.set('hasAttemptedSave', true);
            
            if (passwordFieldsHidden) {
                // Validate the name fields only
                if (formName.valid()) {
                    Ember.Logger.debug(this.toString() +': name fields are valid. Ask controller to update');
                    self.update();
                } else {
                    // Re-enable the submit button
                    submitButton.removeAttr('disabled');
                }
            } else {
                if (formName.valid() && formPassword.valid()) {
                    Ember.Logger.debug(this.toString() +': name and password fields are valid. Ask controller to update');

                    // Clean up any manual errors not handled by $.validator
                    this.resetManualErrors();
                    self.update(true);
                } else {
                    // Re-enable the submit button
                    submitButton.removeAttr('disabled');
                }
            }
        }
    }
});
