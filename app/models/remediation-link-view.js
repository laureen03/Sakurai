import DS from 'ember-data';
import Ember from "ember";
import RemediationLinkView from "../models/remediation-link-view";
import Context from '../utils/context-utils';

export default DS.Model.extend({

    /**
     * Name
     * @property {string}
     */
    remediationLink: DS.belongsTo('remediationLink', { async: true }),

    /**
     * Type
     * @property {string}
     */
    user: DS.belongsTo('user', { async: true }),

    /**
     * Url
     * @property {string}
     */
    views: DS.attr('number'),

    /**
     * Last view at
     * @property {date}
     */
    lastViewAt: DS.attr("date"),

    /**
     * assignment
     * @property {string}
     */
    assignment: DS.belongsTo('assignment', { async: true })


});

RemediationLinkView.reopenClass({

    /**
     * Increments the remediation link view
     * @param {Store} store
     * @param {number} remediationLinkId
     * @param {number} studentId
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    incRemediationLinkViews: function (store, remediationLinkId, studentId, assignmentId){
        return new Ember.RSVP.Promise(function(resolve, reject){
            /*
             NOTE: if there is more work related to updating the data for a student assignment
             it will be best to create a model and an adapter for it, like AuthKey
             For now it is just to much work for a single request
             */
            if(!assignmentId){
                assignmentId = null;
            }
            var url = Context.getBaseUrl() + "/remediationLinkViews/incRemediationLinkView";
            var data = { remediationLink: remediationLinkId, user: studentId, assignment:assignmentId };

            Ember.$.ajax(url, {
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data),
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });

    }


});