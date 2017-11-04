SakuraiWebapp.StudentExamHistoryRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
	model: function(params) {
        var store = this.store;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');

        //gets the active user id to support the impersonated feature
        var userId = authenticationManager.getActiveUserId();
        //Clear Storage for exam, because show the exam history with wrong results

        //TODO: This is a workaround because store.unloadAll('exam') is failing
        //by a bug of ember-data beta.16, Please review again when undate the Ember data.
        //https://github.com/emberjs/data/issues/2982
        var records = store.peekAll('exam');
        records.forEach(function(record) {
          store.unloadRecord(record);
        });

        return Ember.RSVP.hash({
            clazz : store.find("class", params.classId),
            exams: store.query("exam", {classId:params.classId, studentId: userId})
        });
    },

    afterModel:function(model){
        return model.clazz.get('product');
    },

    setupController: function(controller, model) {
        controller.set("class", model.clazz);
        controller.loadExams(model.exams);
    }
});
