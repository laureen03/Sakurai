SakuraiWebapp.InstructorHmcdView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructorComplete',

    didInsertElement : function(){
        this.activeHeaderMenu("menu-hmcd");
        this.fixMainMenu();
        this.fixSecondaryMenu();

        var controller = this.get('controller');
        this.setupScrollToLinks();

        //navigates to a specific section if necessary
        var scrollTo = controller.get("scrollTo");
        if (scrollTo){
            controller.doScrollTo(scrollTo);
        }
    },

    willDestroyElement: function () {
        this.teardownScrollToLinks();
    }
});
