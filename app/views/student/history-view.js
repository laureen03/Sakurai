import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {

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
