import DS from 'ember-data';

export default DS.Model.extend({

    /**
     * Name
     * @property {string}
     */
    text: DS.attr('string'),

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

    question: DS.attr('number')

});