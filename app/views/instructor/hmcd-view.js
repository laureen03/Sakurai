import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructorComplete',

    didInsertElement : function(){
        this.activeHeaderMenu("menu-hmcd");
        this.fixMainMenu();
        this.fixSecondaryMenu();

        var controller = this.get('controller');
        this.setupScrollToLinks();

        //navigates to a specific section if necessary
        var scrollTo = controller.get("scrollTo");
        if (scrollTo){
            controller.doScrollTo(scrollTo);
        }
    },

    willDestroyElement: function () {
        this.teardownScrollToLinks();
    }
});
