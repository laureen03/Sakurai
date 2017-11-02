SakuraiWebapp.LibraryHomeView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forInstructorComplete',

    didInsertElement : function(){
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions : function() {
        if (this.get("controller.isInFrame")) {
            this.get('controller.library').resizeLeftNavigation();
        }
        this.activeHeaderMenu("menu-questionLibrary");
        this.fixMainMenu();
    }
});
