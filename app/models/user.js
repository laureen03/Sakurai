import DS from 'ember-data';
import Ember from "ember";
import User from "../models/user";
import Context from '../utils/context-utils';

export default DS.Model.extend({

    firstName: DS.attr('string'),
    lastName: DS.attr('string'),
    email: DS.attr('string'),
    username: DS.attr('string'),
    nickname: DS.attr('string'),

    /**
     * @property {string} User password
     * TODO: Remove this once a safer approach has been found for updating the password
     * This was added to the model so Ember data allows setting this property
     */
    password: DS.attr('string'),

    /**
     * @property {string} New user password
     * TODO: Remove this once a safer approach has been found for updating the password
     * This was added to the model so Ember data allows setting this property
     */
    newPassword: DS.attr('string'),

    /**
     * @property {string} New user password retyped
     * TODO: Remove this once a safer approach has been found for updating the password
     * This was added to the model so Ember data allows setting this property
     */
    retypePassword: DS.attr('string'),

    /**
     * @property {date} Timestamp of the last time the user logged in
     */
    lastLogin: DS.attr('date'),

    /**
     * @property {number} Number of times the user has logged in
     */
    logins: DS.attr('number'),

    /**
     * @property {string} user's role
     */
    role: DS.attr('string'),

    fullName: Ember.computed('firstName', 'lastName', function(){
        return this.get('lastName') + ', ' + this.get('firstName');
    }),

    fullNameInformal: Ember.computed('firstName', 'lastName', function(){
        return this.get('firstName') + ' ' + this.get('lastName');
    }),

    isInstructor: Ember.computed('role', function(){
        return (User.ROLE_INSTRUCTOR === this.get("role"));
    }),

    isStudent: Ember.computed('role', function(){
        return (User.ROLE_STUDENT === this.get("role"));
    }),

    /**
     * Indicates if the user is an administrator, it could be
     * admin or super admin role
     * @property {bool}
     */
    isAdmin: Ember.computed('role', function(){
        return  (User.ROLE_SUPER_ADMIN === this.get("role")) ||
                (User.ROLE_ADMIN === this.get("role"));
    })
});

/**
 * Adds convenience methods to the User model
 */
User.reopenClass({
    /**
     * Const to manage Instructor
     **/
    ROLE_INSTRUCTOR: "ROLE_INSTRUCTOR",
    /**
     * Const to manage Student
     **/
    ROLE_STUDENT: "ROLE_STUDENT",

    /**
     * Const to manage Super Admin
     **/
    ROLE_SUPER_ADMIN: "ROLE_SUPER_ADMIN",

    /**
     * Const to manage Admin
     **/
    ROLE_ADMIN: "ROLE_ADMIN",

    /**
     * Sends a forgot password request
     * @param email
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    forgotPassword: function(email){
        var url = Context.getBaseUrl();
        url += "/users/forgotPassword";

        return new Ember.RSVP.Promise(function(resolve, reject){
            $.ajax({
                url: url,
                type: 'GET',
                data: {email:email},
                dataType: 'json',
                contentType: 'application/json',
                success: function(result){
                    resolve(result.data);
                },
                error: function(result) {
                    reject(false, result);
                }
            });
        });
    }
});
