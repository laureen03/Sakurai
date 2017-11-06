import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import SortableHelper from 'utils/sortable';

export default Controller.extend(
    ControllerMixin,
    FeatureMixin, {
    headerClasses: Ember.inject.controller(),
    /**
     * @property {Class} the class
     */
    class: null,

    /**
     * @property {SortableHelper|Exam[]} sortable for exam history
     */
    examHistorySortable: null,

    controllerSetup: function(){
        this.set("examHistorySortable",
            SortableHelper.create({ sort: "startedOnTimeStamp", direction:false }));

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