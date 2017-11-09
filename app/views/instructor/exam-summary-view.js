import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructorComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function() {
        this.activeHeaderMenu("menu-summaryExam");
        this.fixMainMenu();
        this.fixSecondaryMenu();
        this.setupScrollToLinks();
    },

    willDestroyElement: function () {
        this.teardownScrollToLinks();
    }
});
