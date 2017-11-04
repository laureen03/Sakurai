import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';

export default Controller.extend(
    ControllerMixin,
    FeatureMixin,
    {

    headerClasses: Ember.inject.controller(),
    instructorPartialHmcdClassPerformance: Ember.inject.controller(),
    instructorPartialHmcdStudentUsage: Ember.inject.controller(),
    instructorPartialHmcdAssignmentsResults: Ember.inject.controller(),
    instructorPartialHmcdOverallUsage: Ember.inject.controller(),
    instructorPartialHmcdStrengthsWeaknesses: Ember.inject.controller(),
    instructorPartialHmcdMisconceptions: Ember.inject.controller(),

    hmcdClassPerformance: Ember.computed.alias('instructorPartialHmcdClassPerformance'),
    hmcdStudentUsage: Ember.computed.alias('instructorPartialHmcdStudentUsage'),
    hmcdAssignmentsResults: Ember.computed.alias('instructorPartialHmcdAssignmentsResults'),
    hmcdOverallUsage: Ember.computed.alias('instructorPartialHmcdOverallUsage'),
    hmcdStrengthsWeaknesses: Ember.computed.alias('instructorPartialHmcdStrengthsWeaknesses'),
    hmcdMisconceptions: Ember.computed.alias('instructorPartialHmcdMisconceptions'),

    queryParams: ['display', 'scrollTo'],

    /**
     * By default it display all, this is useful for testing
     * so it doesn't render all the information all the time
     * This is temporal, a accordion will be implemented
     * @property {display} indicates which module to display
     */
    display: null,

    /**
     * Indicates the section we need to scroll to when loading the page
     * This property is handle by the view
     */
    scrollTo: null,

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {menuSelected} selected Menu
     */
    menuSelected: "",

    /**
     * @property {integer} class id
     */
    classId: null,


    /**
     * Indicates if a module should be displayed
     * @param module
     * @returns {boolean}
     */
    displayEnable: function(module){
        var display = this.get("display");
        return !display || display.indexOf(module) >= 0;
    },

    displayClassPerformance: Ember.computed("display", "classPerformanceLoaded", function(){
        return this.displayEnable("cp") && this.get("classPerformanceLoaded");
    }),

    displayAssignmentResults: Ember.computed("display", "assignmentsResultsLoaded", function(){
        return this.displayEnable("ar") && this.get("assignmentsResultsLoaded");
    }),

    displayStudentUsage: Ember.computed("display", "studentUsageLoaded", function(){
        return this.displayEnable("su") && this.get("studentUsageLoaded");
    }),

    displayStrengthsWeaknesses: Ember.computed("display", "strengthsWeaknessesLoaded", function(){
        return this.displayEnable("sw") && this.get("strengthsWeaknessesLoaded");
    }),

    displayOverallUsage: Ember.computed("display", "overallUsageLoaded", function(){
        return this.displayEnable("ou") && this.get("overallUsageLoaded");
    }),

    displayMisconceptions: Ember.computed("display", "misconceptionsLoaded", function(){
        return this.displayEnable("m") && this.get("misconceptionsLoaded");
    }),

    displayEnrollStudent: Ember.computed('display', function(){
        return this.displayEnable("es");
    }),

    /** loading properties */
    classPerformanceLoaded: false,
    assignmentsResultsLoaded: false,
    studentUsageLoaded: false,
    strengthsWeaknessesLoaded: false,
    overallUsageLoaded: false,
    misconceptionsLoaded: false,

    resetValues: function(){
        this.set("classPerformanceLoaded", false);
        this.set("assignmentsResultsLoaded", false);
        this.set("studentUsageLoaded", false);
        this.set("strengthsWeaknessesLoaded", false);
        this.set("overallUsageLoaded", false);
        this.set("misconceptionsLoaded", false);


        this.get("hmcdAssignmentsResults").resetValues();
        this.get("hmcdStudentUsage").resetValues();
        this.set("display", null);
        this.set("scrollTo", null);
    },

    /**
     * Scroll to a specific section
     * @param section
     */
    doScrollTo: function(section){
        $(".selected").removeClass("selected");
        $("#link-" + section).addClass("selected");
        $('#'+section)[0].scrollIntoView();
    },

    /**
     * Initializes class performance
     * @param overallPerformance
     * @param studentUsage
     */
    initClassPerformance: function(overallPerformance, studentUsage){
        this.set("classPerformanceLoaded", true);
        this.get("hmcdClassPerformance").initClassPerformance(overallPerformance, studentUsage);
        Ember.Logger.debug("Class Performance Loaded");
    },

    /**
     * Initializes student usage
     * @param studentUsage
     */
    initStudentUsage: function(studentUsage){
        this.set("studentUsageLoaded", true);
        this.get("hmcdStudentUsage").initStudentUsage(studentUsage);
        Ember.Logger.debug("Student Usage Loaded");
    },

    /**
     * Initializes overall usage
     * @param metadata
     * @param classUsage
     */
    initOverallUsage: function(metadata, classUsage){
        this.set("overallUsageLoaded", true);
        this.get("hmcdOverallUsage").initOverallUsage(metadata, classUsage);
        Ember.Logger.debug("Overall Usage Loaded");
    },

    /**
     * Initializes assignments results
     * @param assignments
     */
    initQcAssignmentResults: function(assignments){
        this.set("assignmentsResultsLoaded", true);
        this.get("hmcdAssignmentsResults").initQcAssignmentResults(assignments);
        Ember.Logger.debug("Assignment Results Loaded");
    },

    /**
     * Initializes S&W
     * @param taxonomySettings
     * @param chapterStats
     * @param termTaxonomyStats
     */
    initStrengthsWeaknesses: function(taxonomySettings, chapterStats, termTaxonomyStats){
        this.set("strengthsWeaknessesLoaded", true);
        this.get("hmcdStrengthsWeaknesses").initStrengthsWeaknesses(taxonomySettings, chapterStats, termTaxonomyStats);
        Ember.Logger.debug("Strengths Weaknesses Loaded");
    },

    /**
     * Initializes misconceptions
     * @param classMisconceptions
     */
    initMisconceptions: function(classMisconceptions){
        this.set("misconceptionsLoaded", true);
        this.get("hmcdMisconceptions").initMisconceptions(classMisconceptions);
        Ember.Logger.debug("Misconceptions Loaded");
    },

    actions:{
        goToSection: function(section){
            this.doScrollTo(section);
        }
    }
});
