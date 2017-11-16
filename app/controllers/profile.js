
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import ProfileMixin from 'sakurai-webapp/mixins/profile';
import User from "sakurai-webapp/models/user";

export default Ember.Controller.extend(
    ControllerMixin, 
    ProfileMixin,{

    user: null,

    firstName: '',

    lastName: '',

    updateFail: function (errorsArr) {
        if (errorsArr) {
            Ember.Logger.error(this.toString() + ': unable to update user record. ' + errorsArr[0].info);
            this.trigger('profile.save.failed', errorsArr[0].code);
        } else {
            Ember.Logger.error(this.toString() + ': unable to update user record');
            this.trigger('profile.save.failed');
        }
    },

    updateSuccess: function (nameOnly) {
        Ember.Logger.debug(this.toString() + ': profile updated successfully');
        this.trigger('profile.save.success', nameOnly);
    },

    cleanPasswordValues: function() {
        var userRecord = this.get('user');

        userRecord.setProperties({ password: null,
                                   newPassword: null,
                                   retypePassword: null });
    },

    resetValues: function() {
            var userRecord = this.get('user');

            this.set('firstName', userRecord.get('firstName'));
            this.set('lastName', userRecord.get('lastName'));

            this.cleanPasswordValues();
            if(userRecord.get("isAdmin")){
                this.transitionToRoute("/admin/products/0");
            }
    },

    actions: {

        update: function(changePassword) {
            var userRecord = this.get('user'),
                firstName = this.get('firstName'),
                lastName = this.get('lastName'),
                self = this;

            if (changePassword) {
                // Verify that the password change is processed successfully
                // before updating the name
                Ember.Logger.debug(self.toString() + ': update password');

                userRecord.save().then( function(response) {

                    // Because we don't want the app to send back the password in the response,
                    // we rely on the errors info in the metadata to find out if something
                    // went wrong
                    var errors = response.store.metadataFor(User).errors || [];

                    if (errors.length) {
                        self.updateFail(errors);
                    } else {
                        Ember.Logger.debug(self.toString() + ': password updated successfully');

                        // It's now safe to update the first and last name fields
                        userRecord.set('firstName', firstName);
                        userRecord.set('lastName', lastName);

                        // Unset the password fields because we don't need to update those anymore
                        userRecord.setProperties({ password: null,
                                                   newPassword: null,
                                                   retypePassword: null });

                        Ember.Logger.debug(self.toString() + ': update name :', userRecord);

                        userRecord.save().then( function(response) {

                            var errors = response.store.metadataFor(User).errors || [];

                            if (errors.length) {
                                self.updateFail(errors);
                            } else {
                                self.updateSuccess(false);
                            }
                        }, function() {
                            self.updateFail();
                        });
                    }
                }, function() {
                    self.updateFail();
                });

            } else {
                // Update first and last name fields in the model
                userRecord.set('firstName', firstName);
                userRecord.set('lastName', lastName);

                Ember.Logger.debug(self.toString() + ': save user record :', userRecord);

                userRecord.save().then( function(response) {

                    var errors = response.store.metadataFor(User).errors || [];

                    if (errors.length) {
                        self.updateFail(errors);
                    } else {
                        self.updateSuccess(true);
                    }
                }, function() {
                    self.updateFail();
                });
            }
        }
    }
});
