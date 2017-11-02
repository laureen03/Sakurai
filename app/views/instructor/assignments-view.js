SakuraiWebapp.InstructorAssignmentsView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructor',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions : function() {
        var controller = this.get('controller');
        if(controller.get("isPrevHMCD")) {
            this.activeHeaderMenu("menu-hmcd");
        } else if (controller.get('prevPage') == 'manageAssignment') {
            this.activeHeaderMenu("menu-assignQuiz");
        } else {
            controller.set('prevPage', 'hmcd');
            this.activeHeaderMenu("menu-summaryExam");
        }

        this.fixMainMenu();
    }

});
