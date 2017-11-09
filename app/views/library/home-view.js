import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
        
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
