/**
 * Component for displaying a set of student usage statistics (PUSAK-699)
 *
 * @extends Ember.Component
 *
 * @param data-component-class {string} special class to add to the component's tag (optional)
 * @param data-stats {StudentUsage[]} an array of StudentUsage models used to perform
 *      all the calculations for the component.
 *
 */

import Ember from "ember"; 

export default Ember.Component.extend({ 

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['usage-stat'],
    classNameBindings: ['data-component-class'],

    /*
     * @property {string} Special component class
     */
    'data-component-class': '',

    getPercentage: function (value, total) {
        if (total) {
            return Math.round( value / total * 100);
        }
        return 0;
    },

    /*
     * @property {number} Average number of exams per student
     */
    averageExamsPerStudent: Ember.computed('totalCompletedExams', 'totalStudents', function(){
        var totalStudents = this.get('totalStudents');

        if (totalStudents) {
            return Math.round(this.get('totalCompletedExams') / totalStudents);
        }
        return 0;
    }),

    /*
     * @property {Ember.A} An array filled with only the number of exams completed that are greater than zero
     */
    examsCompletedArray: Ember.computed('data-stats', function(){
        return this.get('data-stats').filter( function (item) {
            return item.get('examsCompleted') > 0;
        }).mapBy('examsCompleted');
    }),

    /*
     * @property {number} Number of students with one or more exams completed
     */
    numWithCompletedExams: Ember.computed('examsCompletedArray', function(){
        return this.get('examsCompletedArray').get('length');
    }),

    /*
     * @property {number} Number of students that have an overall mastery level above 5
     */
    numWithHigherML: Ember.computed('data-stats', function(){
        var filteredArray = this.get('data-stats').filter( function(item) {
            return item.get('masteryLevel') > 5;
        });
        return filteredArray.get('length');
    }),

    /*
     * @property {number} Number of students that have completed 10 or more exams
     */
    numWithMoreExams: Ember.computed('examsCompletedArray', function(){
        var filteredArray = this.get('examsCompletedArray').filter( function (value) {
            return value >= 10;
        });
        return filteredArray.get('length');
    }),

    /*
     * @property {number} Percentages of students with one or more exams completed
     */
    percentageWithCompletedExams: Ember.computed('numWithCompletedExams', 'totalStudents', function(){
        return this.getPercentage(this.get('numWithCompletedExams'), this.get('totalStudents'));
    }),

    /*
     * @property {number} Percentage of students that have an overall mastery level above 5
     */
    percentageWithHigherML: Ember.computed('numWithHigherML', 'totalStudents', function(){
        return this.getPercentage(this.get('numWithHigherML'), this.get('totalStudents'));
    }),

    /*
     * @property {number} Percentage of students that have completed 10 or more exams
     */
    percentageWithMoreExams: Ember.computed('numWithMoreExams', 'totalStudents', function(){
        return this.getPercentage(this.get('numWithMoreExams'), this.get('totalStudents'));
    }),

    /*
     * @property {number} Total number of completed exams
     */
    totalCompletedExams: Ember.computed('examsCompletedArray', function(){
        return this.get('examsCompletedArray').reduce( function (prevValue, value) {
            return prevValue + value;
        }, 0);
    }),

    /*
     * @property {number} Total number of students (per items in @data-stats)
     */
    totalStudents: Ember.computed('data-stats', function(){
        return this.get('data-stats').get('length');
    })

});
