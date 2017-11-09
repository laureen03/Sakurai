import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forInstructorComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function(){
    	var controller = this.get('controller');
    	if (controller.get("assignment.isExamAssignment")) {
            this.activeHeaderMenu("menu-summaryExam");
        } else {
            this.activeHeaderMenu("menu-hmcd");
        }
        this.fixMainMenu();
    }
});
