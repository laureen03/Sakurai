import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";

export default Route.extend(
    ResetScroll,{

    deactivate: function() {
        var controller = this.get('controller');
        controller.set("term", "");
    }
});