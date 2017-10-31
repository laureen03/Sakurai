import DS from 'ember-data';

export default DS.Model.extend({

    /**
     * Total number of logins within the specified period
     * @property {number}
     */
    totalLogins: DS.attr('number'),

    /**
     * Date string for the first time ever the user signed in
     * @property {string}
     */
    initialLogin: DS.attr('string'),

    /**
     * Date string for the last time the user signed in
     * @property {string}
     */
    lastLogin: DS.attr('string'),

    /**
     * Array of Objects, each one containing the following fields:
     * - id
     * - total: total number of logins per interval of time (default: daily)
     * - date: date associated to the number of logins
     * @property {Array}
     */
    logins: DS.attr()

});
