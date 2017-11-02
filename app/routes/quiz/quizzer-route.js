SakuraiWebapp.QuizQuizzerRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    model: function (params) {
        var store = this.store;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var isExam = (params.isExam == "true");

        var entity = null;

        if (params.isReviewRefresh)
            entity = "reviewRefreshQuiz";
        else
            entity = (!isExam) ? "quiz" : "exam";

        return new Ember.RSVP.Promise(function(resolve, reject){
            store.find(entity, params.id).then( function(record) {
                    store.unloadRecord(record);
                    Ember.RSVP.hash({
                        quiz : store.find(entity, params.id),
                        clazz: store.find("class", params.classId),
                        isExam: isExam,
                        params: params
                    }).then(resolve, reject);
            }, reject);
        });

    },

    afterModel: function(model, transition) {
        var controller = this;

        var quiz = model.quiz;
        var hasAssignment = quiz.get("hasAssignment");
        if (hasAssignment){
            return quiz.get("assignment").then(function(assignment){

                if (assignment && !assignment.get("isAvailable")) {
                    controller.transitionTo("/student/assignment/" + model.clazz.get('id') + "/" + assignment.get("id"));
                }
            });
        }

        return true;
    },

    setupController: function (controller, model) {
        controller.set("selectedQuiz", model.quiz);
        controller.set("class", model.clazz);
        controller.set("questionIndex", model.quiz.get("questionIndex"));
        controller.initialize();
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }
});