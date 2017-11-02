SakuraiWebapp.LibrarySelectQuestionRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
	model: function(params) {
        var store = this.store;
        return Ember.RSVP.hash({
            class : store.find("class", params.classId),
            params: params
        });
	},

    afterModel:function(model){

    },

	setupController: function(controller, model) {
        var product =  model.class.get('product');
	},

	deactivate: function() {

    }

});
