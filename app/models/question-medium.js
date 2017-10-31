import DS from 'ember-data';

export default DS.Model.extend({
    mediaType: DS.attr('string'),
    relativePath: DS.attr('string'),
    absolutePath: DS.attr('string'),
    content: DS.attr("string")
});
