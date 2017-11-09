/**
 *
 * @type {SakuraiWebapp.AdminHomeView}
 */
import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
	UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forAdmin',
    didInsertElement : function(){
        this.fixMainMenu();
    }
});
