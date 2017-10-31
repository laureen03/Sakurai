import DS from 'ember-data';

export default DS.Model.extend({
    /**
    * @property {Class} Current Class Information
    **/
    class: DS.belongsTo('class', { async: true }),

    /**
    * @property {bool} hide nclex threshold
    **/
    hideThresholdLabels: DS.attr('boolean'),

    /**
    * @property {int} nclex proficiency threshold
    **/
    customThreshold: DS.attr('number')
});
