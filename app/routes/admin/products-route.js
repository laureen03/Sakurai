/**
 * Admin Home route
 * @type {SakuraiWebapp.AdminProductsRoute}
 */
SakuraiWebapp.AdminProductsRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
	queryParams: {
        classId: { refreshModel: true }
    },
	model: function(params) {
		if (params.classId != 0)
    		this.transitionTo('library.home', params.classId);   
    },
});