import Controller from '@ember/controller';
import ControllerMixin from 'mixins/controller';

export default Controller.extend(
    ControllerMixin, {
	/**
     * @property {string}
     */
    classAverageMasteryLevel : "1.0",

    /**
     * @property {StudentUsage[]} student usage table
     */
    studentUsage: null,

    /**
     * @property {StudentUsage[]} student usage information
     */
    overallPerformance: null,

    /**
    *  Init values for Class Performances
    **/
    initClassPerformance:function(overallPerformance, studentUsage){
    	var controller = this;
    	controller.set("overallPerformance", overallPerformance);
    	controller.loadStudentUsageIfNecessary(studentUsage);
    },

    /**
     * Loads the student usage information if necessary
     */
    loadStudentUsageIfNecessary: function(studentUsage){
        var controller = this;
        var metadata = studentUsage.get('meta');
        controller.set("classAverageMasteryLevel", metadata.classAverageMasteryLevel);
        controller.set("studentUsage", studentUsage);
    }
});
