SakuraiWebapp.StudentEnrollView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forstudent',

    didInsertElement : function(){
        this.fixMainMenu();
    }

});
