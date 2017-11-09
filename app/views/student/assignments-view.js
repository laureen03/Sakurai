import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forStudentComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function(){
        this.activeHeaderMenu("menu-assignments");

        this.fixMainMenu();
    }
});
