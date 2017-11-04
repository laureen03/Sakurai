SakuraiWebapp.InstructorAssignmentSummaryView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forInstructorComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function(){
    	var controller = this.get('controller');
    	if (controller.get("assignment.isExamAssignment")) {
            this.activeHeaderMenu("menu-summaryExam");
        } else {
            this.activeHeaderMenu("menu-hmcd");
        }
        this.fixMainMenu();
    }
});
