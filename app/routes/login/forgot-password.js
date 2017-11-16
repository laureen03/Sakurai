import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";

export default Ember.Route.extend(
    ResetScroll,{

    deactivate: function () {
        var controller = this.get('controller');
        controller.resetValues();
    }
});