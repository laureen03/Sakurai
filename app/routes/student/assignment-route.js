SakuraiWebapp.StudentAssignmentRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
    model: function(params) {
        var store = this.store;
        var userId;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        userId = authenticationManager.getActiveUserId();
        
        return Ember.RSVP.hash({
            assignments : store.query("assignment", {
                            assignmentId:params.assignmentId,
                            studentId: userId
                        }),
            class : store.find("class", params.classId),
            userId: userId

        });
    },

    afterModel: function(model){
        var assignment = model.assignments.nextObject(0);
        
        return Ember.RSVP.hash({
            product: model.class.get("product"), //preload product
            termTaxonomy: assignment.get("termTaxonomy"), //preload taxonomy
            chapter: assignment.get("chapter") //preload chapter
        }).then(function(hash){
                model.assignment = assignment;
        });
    },

    setupController: function(controller, model) {
        controller.set("assignment", model.assignment);
        controller.set("class", model.class);
        controller.set("numQuestions", model.class.get("product").get("quizLengths"));
        controller.set("studentId", model.userId);


    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.set("failedMessage", "");
        controller.set('showQuizzes', false);
    }
});