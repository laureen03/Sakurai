SakuraiWebapp.InstructorQcAssignmentSummaryView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forInstructorComplete',

    didInsertElement : function(){
        this.fixMainMenu();
    }
});
