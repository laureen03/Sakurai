import DS from 'ember-data';
import Ember from "ember";
import RemediationLink from "../models/remediation-link";

export default DS.Model.extend({

    /**
     * Name
     * @property {string}
     */
    name: DS.attr('string'),

    /**
     * Type
     * @property {string}
     */
    type: DS.attr('string'),

    /**
     * Url
     * @property {string}
     */
    url: DS.attr('string'),

    /**
     * This property is not a belongsTo to prevent a non desired behavior with ember and bidirectional relationships
     * @see https://github.com/nolanlawson/ember-pouch/issues/16
     * @see http://stackoverflow.com/questions/19716852/ember-data-1-0-x-not-saving-hasmany-relationship-when-bidirectional
     * @param question
     * @property {Question} Current Question Information
    **/
    question: DS.attr('number'),

    /**
     * Additional parameters for this remediation link
     */
    parameters: DS.attr(),

    isLP: Ember.computed('type', function(){
        return this.get("type") === RemediationLink.LP;
    }),

    isLA: Ember.computed('type', function(){
        return this.get("type") === RemediationLink.LA;
    }),

    isWeb: Ember.computed('type', function(){
        return this.get("type") === RemediationLink.WEB;
    }),

    /**
     * Returns the full url
     */
    fullUrl: Ember.computed("url", "type", "parameters", function(){
        var fullUrl = this.get("url");

        if (this.get("isLP") || this.get("isLA")){
            var parameters = this.get("parameters");
            fullUrl += fullUrl.indexOf("?") !== -1 ? '&' : "?";
            fullUrl +=
                ("siteId=" + parameters.siteId) +
                ("&key=" + parameters.key) +
                ("&cssUrl=" + parameters.cssUrl);
        }
        return fullUrl;
    })

});

RemediationLink.reopenClass({

    LP: "LP", 
    LA: "LA",
    WEB: "web",

    getRemediationLinksTypes: function(){
        return [
            {
                id: RemediationLink.LA,
                name: I18n.t(RemediationLink.LA)
            },
            {
                id: RemediationLink.LP,
                name: I18n.t(RemediationLink.LP)
            },
            {
                id: RemediationLink.WEB,
                name: I18n.t(RemediationLink.WEB)
            }

        ];
    }
});