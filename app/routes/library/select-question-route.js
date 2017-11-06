import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";

export default Route.extend(
    ResetScroll,{

	model: function(params) {
        var store = this.store;
        return Ember.RSVP.hash({
            class : store.find("class", params.classId),
            params: params
        });
	}

});
