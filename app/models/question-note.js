import DS from 'ember-data';

export default DS.Model.extend({

    /**
     * @property {string} Code/name of the audited action
     */
    action: DS.attr('string'),

    /**
     * @property {User.id} User who performed the action
     */
    createdBy: DS.belongsTo('user', { async: true }),

    /**
     * @property {Date} Date when the action was carried out
     */
    date: DS.attr('date'),

    /**
     * @property {string} Additional information about the action performed
     */
    detail: DS.attr('string'),

    /**
     * @property {string} Additional information about the action performed
     */
    question: DS.belongsTo('question', {async: true})
});


