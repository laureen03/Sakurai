
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';

export default Ember.Controller.extend(
    ControllerMixin,
    FeatureMixin, {
    headerClasses: Ember.inject.controller(),

    queryParams: ['studentId'],

    /**
     * @property {
     Class} the class
     */
    class: null,

    /**
     * @property indicates student ID if the page is accessing by instructor
     */
    studentId: null,

    /**
     * @property {
     ExamStat} the exam stats
     */
    examStat: null,

    /**
     * @property {
     TermTaxonomyStat} the term taxonomy stats
     */
    termTaxonomyStat: null,

    /**
     * @property {
     ChapterStat} chapter stats (nursing topics)
     */
    chapterStat: null,

    /**
     * @property {String} Product passing threshold lower limit
     */
    thresholdLowerLimit: 0,

    /**
     * @property {String} Product passing threshold upper limit
     */
    thresholdUpperLimit: 0,

    /**
     * @property {number} Total number of exams in the chart
     **/
    examTotal: Ember.computed.alias('examStat.exams.length'),

    /**
     * @property {number} Number of exams to show per page in the chart
     **/
    examPageLength: 10,

    /**
     * @property {number} Current page number in the chart
     **/
    examCurrentPage: 1,

    /**
     * TODO: lets create a separate controller (using render) for each section in this page
     * @see hmcd_controller.js
     */

    /**
     * {bool} Indicates if the impersonated student header is enabled
     */
    impersonatedHeaderEnabled: Ember.computed("isImpersonated", "isInFrame", function(){
        return this.get("isImpersonated") && this.get("isInFrame");
    }),


    /**
     * Resets default values
     */
    resetValues: function(){

    },

    actions:{
        goBackToExamSummary: function(){
            this.transitionToRoute("/instructor/examSummary/" + this.get("class").get("id"));
        },

        /**
         * Resets default values
         */
        updateGraph: function(currentPage){
            this.set("examCurrentPage", currentPage);
        }
    }
});
