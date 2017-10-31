import DS from 'ember-data';

export default DS.Model.extend({
    averageScore: DS.attr('number'),
    classAverageScore: DS.attr('number'),
    assignmentsOpen: DS.attr('number'),
    classPossiblePoints: DS.attr('number'),
    possiblePoints: DS.attr('number')
});