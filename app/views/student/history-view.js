SakuraiWebapp.StudentHistoryView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forStudentComplete',
    didReceiveAttrs : function(){
        this.activeHeaderMenu("menu-haid");

        this.fixMainMenu();

 		var controller = this.get('controller');
        controller.setPagination("ML");
        controller.setPagination("QC");
        controller.setPagination("RR");

        $('.ml-select').select2({
            minimumResultsForSearch: -1
        });
    }
});
