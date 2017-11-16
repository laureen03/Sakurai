
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";

export default Ember.Route.extend(
    ResetScroll,{

	model: function(params) {
        var store = this.store;
        return Ember.RSVP.hash({
            class : store.find("class", params.classId),
            params: params
        });
	}

});
