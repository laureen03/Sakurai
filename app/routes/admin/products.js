/**
 * Admin Home route
 * @type {SakuraiWebapp.AdminProductsRoute}
 */

import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";

export default Ember.Route.extend(
	ResetScroll,{

	queryParams: {
        classId: { refreshModel: true }
    },
	model: function(params) {
		if (params.classId !== 0){
    		this.transitionTo('library.home', params.classId);   
		}
    },
});