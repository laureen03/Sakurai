import Ember from "ember";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend({

    /**
     * Route names which do not require a user session
     * @property {array}
     */
    anonymous: ['index', 'login.forgotPassword', 'login.sso', 'login.mimic'],

    beforeModel: function (transition) {
        var route = this;
        var store = this.store;
        return new Ember.RSVP.Promise(function(resolve){
            if (!route.get('anonymous').contains(transition.targetName)){
                debugger;
                var authenticationManager = context.get('authenticationManager');
                authenticationManager.authenticateFromStorage(store).then(function(data){
                    if (!data.fromStorage || !data.authenticated){
                        Ember.Logger.debug("Invalid token in storage");
                        route.transitionTo("index");
                    }
                    resolve();

                });
            }
            else{
                resolve();
            }
        });
    },

    /**
     * Resolves the error information from the reason
     *
     * i.e resolveError(reason, { "cannot_modify_demo_data" : "error.assignments.canNotDeleteDemoAssignment" });
     * @param {{}} reason
     * @param {Object} i18nCodes mapping between error code and i18n key for message
     * @returns {{code: string, message: *}}
     */
    resolveError: function(reason, i18nCodes){
        var errors = (reason.responseJSON) ? reason.responseJSON.errors: reason,
            error = { code: "unexpected_error" };

        // FIXME: It seems like reason.responseJSON.errors is supposed to be an array
        // while the Ember error object (reason) isn't so errors[0].code will fail
        // Not clear on what error formats are expected by this method

        if ($.isArray(errors) && errors.length > 0){ //handles a Sakurai end point error response
            var code = errors[0].code;
            //checks if default error code message is overridden
            var message = (i18nCodes && i18nCodes[code]) ?
                I18n.t(i18nCodes[code]) :
                I18n.t("error." + errors[0].code);

            error = {
                code: code,
                message: message
            };
        } else if (reason.message) {
            // Though this message is not i18n, for debugging purposes it's better than
            // an "unexpected error" message
            error.message = reason.message;
        } else {
            error.message = I18n.t("error.unexpectedError");
        }

        return error;
    },


    actions: {
        error: function(data, transition) {
            Ember.Logger.debug('global error handler');
            Ember.Logger.debug(data);
            Ember.Logger.debug(transition);

            var message = data.message;
            if (data.reason){ //custom error caught and thrown by controllers
                var error = this.resolveError(data.reason, data.i18nCodes);
                message = error.message;
            }
            if (!message) {
                switch (data.status) {
                    case 401:
                        message = I18n.t('error.global.401');
                        break;
                    default:
                        message = I18n.t('error.unexpectedError');
                }
            }
            //@TODO: handle model end point error properly

            // Remove the loading spinner before presenting the error message
            context.set("isLoading", false);
            toastr.error(message);

            // Manage your errors
            //Ember.onerror(error);
            return false;
        },

        loading: function () {

            Ember.Logger.debug('Enabling global loading');

            //context.set("isLoading", true);
            this.router.one('didTransition', function () {
                //context.set("isLoading", false);

                Ember.Logger.debug('Disabling global loading');
            });
            // substate implementation when returning `true`
            return true;
        }
    }

});
