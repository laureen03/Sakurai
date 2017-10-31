import DS from 'ember-data';

export default DS.Model.extend({

    /**
     * @property latest mastery level
     */
    masteryLevel: DS.attr('number'),

    /**
     * @property {number} Number of quizzes completed by a student for a specific product
     */
    quizzesCompleted: DS.attr('number'),

    /**
     * @property {number} Number of exams completed by a student for a specific product
     */
    examsCompleted: DS.attr('number'),

    /**
     * @property {number} Number of question answered by a student for a specific product
     */
    questionsAnswered: DS.attr('number'),

    /**
     * @property {date} Last exam took at
     */
    lastExamAt: DS.attr('date'),

    /**
     * @property user
     */
    user: DS.belongsTo("user", { async: true }),

    /**
     * Total remediation link views
     * @property {number}
     */
    totalRemediationLinkViews: DS.attr('number'),

    /**
     * Number of logins by a user to a specific class
     * @property {number}
     */
    logins: DS.attr('number'),

    /**
     * Date for the last time the user signed in
     * @property {date}
     */
    lastLogin: DS.attr('date'),

    /**
     * Date for the first time ever the user signed in
     * @property {date}
     */
    initialLogin: DS.attr('date'),

});
