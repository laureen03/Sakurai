SakuraiWebapp.StudentAssignmentsView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forStudentComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function(){
        this.activeHeaderMenu("menu-assignments");

        this.fixMainMenu();
    }
});
