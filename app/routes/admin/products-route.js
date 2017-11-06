/**
 * Admin Home route
 * @type {SakuraiWebapp.AdminProductsRoute}
 */

import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";

export default Route.extend(
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