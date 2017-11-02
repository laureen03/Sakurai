SakuraiWebapp.InstructorCustomizeExamView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructorComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions : function() {
        this.activeHeaderMenu("menu-assignExam");
        this.fixMainMenu();
    }

});
