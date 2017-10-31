/*global Ember*/
import DS from 'ember-data';
import Enrollment from "../models/enrollment";
import Context from '../utils/context-utils';

export default DS.Model.extend({
    code: DS.attr('string'),
    user: DS.belongsTo('user', { async: true }),
    class: DS.belongsTo('class', { async: true })
});

Enrollment.reopenClass({
    /**
     * Creates a new result record
     * @param store
     * @param data result data
     */
    createEnrollmentRecord: function (store, data) {
        return new Ember.RSVP.Promise(function (resolve) {

            var studentId = data.user;

            var result = store.createRecord("enrollment", {
                code: data.code
            });

            Ember.RSVP.Promise.all(
                [
                    store.find("user", studentId)
                ]).
                then(function (values) {
                    var user = values[0];
                    result.set('user', user);

                    resolve(result);
                });
        });
    },

    /**
     * Creates a new result record
     * @param store
     * @param data result data
     */
    createEnrollmentRecordSelfStudy: function (store, data) {
        return new Ember.RSVP.Promise(function (resolve) {

            var studentId = data.user;

            var result = store.createRecord("enrollment", {
                class: data.clazz
            });

            store.find("user", studentId).then(
                function (user) {
                    result.set('user', user);
                    resolve(result);
                }
            );
        });
    },

    deleteEnrollmentRecord: function(store,data){
        var classId = data.classId;
        var studentId = data.studentId;

        var url = Context.getBaseUrl();
        url += '/enrollments/' + classId + '/' + studentId;

        return new Ember.RSVP.Promise(function(resolve, reject){
            $.ajax({
                url: url,
                type: 'DELETE',
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