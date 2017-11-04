SakuraiWebapp.LibraryImportView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {

    layoutName: 'layout/forInstructorComplete',

    didReceiveAttrs : function(){
        this.activeHeaderMenu("menu-questionLibrary");

        this.fixMainMenu();
    }

});
