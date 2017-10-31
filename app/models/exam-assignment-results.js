import DS from 'ember-data';

export default DS.Model.extend({
    assignment: DS.belongsTo('assignment', { async: true }),
    totalQuestions: DS.attr("number"),
    examsCompleted: DS.attr("number"),
    examAvgMastery: DS.attr("number")

});
