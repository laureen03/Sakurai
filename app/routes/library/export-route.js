SakuraiWebapp.LibraryExportRoute = Ember.Route.extend(
    SakuraiWebapp.FeatureMixin, SakuraiWebapp.ResetScroll, {

	model: function(params) {
        var store = this.store;
        
        return Ember.RSVP.hash({
            questionSet: store.find("questionSet", {"questionSetId": params.qsId})
        });
	},

	setupController: function(controller, model) {
        var questionSet = null;

        if (model.questionSet){
            questionSet = model.questionSet.get('firstObject');
            controller.set('questionSet', questionSet);
            controller.set("questions", questionSet.get("questions"));
        }
	}

});
