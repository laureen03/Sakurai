SakuraiWebapp.StudentExamHistoryController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin, {
    headerClasses: Ember.inject.controller(),
    /**
     * @property {SakuraiWebapp.Class} the class
     */
    class: null,

    /**
     * @property {SortableHelper|Exam[]} sortable for exam history
     */
    examHistorySortable: null,

    controllerSetup: function(){
        this.set("examHistorySortable",
            SakuraiWebapp.SortableHelper.create({ sort: "startedOnTimeStamp", direction:false }));

    }.on('init'),

    loadExams: function(exams){
        var sortable = this.get("examHistorySortable");
        sortable.set("data", exams);
    },

    actions: {
        viewResults: function(id){
            this.transitionToRoute("/exam/result/" + id + "/" + this.get("class.id"));
        },

        goToExam: function(id){
            this.transitionToRoute("/quiz/quizzer/" + id + "/" + this.get("class.id") +"?animation=false&isExam=true");
        },

        onSortByCriteria: function(sortableId, criteria){
            var controller = this;
            controller.sortByCriteria(sortableId, criteria);
        }
    }
});