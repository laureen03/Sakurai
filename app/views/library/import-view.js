import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {

    layoutName: 'layout/forInstructorComplete',

    didReceiveAttrs : function(){
        this.activeHeaderMenu("menu-questionLibrary");

        this.fixMainMenu();
    }

});
