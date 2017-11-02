SakuraiWebapp.InstructorClassView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forInstructor',

    didInsertElement : function(){
        this.fixMainMenu();
    }
});
