SakuraiWebapp.LibraryDataTypeFiltersView = Ember.Component.extend({
    layoutName: 'layout/forInstructorComplete',
    didReceiveAttrs : function(){
        this.get('controller.headerClasses').activeHeaderMenu("menu-questionLibrary");
    }
});
