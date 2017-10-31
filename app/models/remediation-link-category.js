import DS from 'ember-data';

export default DS.Model.extend({
    level: DS.attr('number'),

    name: DS.attr('string'),
    /**
     * @property {SakuraiWebapp.RemediationLink[]}
     */
    remediationLinks: DS.hasMany('remediationLink', { async: true }),
    /**
     * @property {SakuraiWebapp.RemediationLinkCategory[]}
     */
    subCategories: DS.hasMany('remediationLinkCategory', { async: true }),
});