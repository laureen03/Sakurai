SakuraiWebapp.InstructorQcAssignmentSummaryRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
    model: function(params) {
        var store = this.get('store');

        return Ember.RSVP.hash({
            class : store.find('class', params.classId),
            assignment : store.query('assignment', { assignmentId: params.assignmentId,
            								        classId: params.classId })
        });
    },

    afterModel: function(model){
        var store = this.get("store"),
            clazz = model.class,
            assignment = model.assignment.nextObject(0);

        // Set search queryParams
        var queryParams = {
            "productId": !!clazz.get("product") ? clazz.get("product").get("id") : undefined,
            "assignmentId": !!assignment.get("id") ? assignment.get("id") : undefined,
            "referencedClassId" : !!clazz.get("id") ? clazz.get("id") : undefined,
            "currentPage" : 1
        };


        return clazz.get("product").then(function(product){
            var promise = store.query("question", queryParams);

            return promise.then(function(questions){
                model.questions = questions;
                return questions;
            })
        })
    },

    setupController: function(controller, model) {
        var assignment = model.assignment.nextObject(0),
        promises = [],
        store = this.get("store"),
        metadata = store._metadataFor("question");
        controller.updateMetadata(metadata);

        controller.set('class', model.class);
        controller.set('assignment', assignment);
        controller.set('questions', model.questions);

        assignment.get("studentResults").then( function(studentResults) {
            promises.push(studentResults.map(function(studentResult){
                return studentResult.get('user');
            }));

            Ember.RSVP.all(promises).then(function () {
                controller.loadStudentResults(studentResults);
            });
        });
    }
});
