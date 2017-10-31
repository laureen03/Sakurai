import DS from 'ember-data';

export default DS.Model.extend({
    totalQuizzes: DS.attr('number'),
    totalSections: DS.attr('number'),
    totalQuestions: DS.attr('number'),
    masteryLevel: DS.attr('number'),
    classAvgNumQuizzes: DS.attr('number'),
    studentPerformance: DS.attr(),
    classPerformance: DS.attr(),

    /**
     * Indicates when the model contains class performance information
     * @returns {boolean}
     */
    hasClassPerformance: function(){
        return this.get("classPerformance") && this.get("classPerformance").length > 0;
    },

    /**
     * Indicates when the model contains student performance information
     * @returns {boolean}
     */
    hasStudentPerformance: function(){
        return this.get("studentPerformance") && this.get("studentPerformance").length > 0;
    }


});
