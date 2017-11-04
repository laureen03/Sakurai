SakuraiWebapp.StudentSectionView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forStudentComplete',
    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function(){
        this.activeHeaderMenu("menu-practiceQuiz");

        this.fixMainMenu();
  	}
});