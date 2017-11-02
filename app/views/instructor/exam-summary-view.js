SakuraiWebapp.InstructorExamSummaryView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructorComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function() {
        this.activeHeaderMenu("menu-summaryExam");
        this.fixMainMenu();
        this.fixSecondaryMenu();
        this.setupScrollToLinks();
    },

    willDestroyElement: function () {
        this.teardownScrollToLinks();
    }
});
