
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import DateUtil from 'sakurai-webapp/utils/date-util';
import SortableHelper from 'sakurai-webapp/utils/sortable';

export default Ember.Controller.extend(
    ControllerMixin,
    FeatureMixin,{
    headerClasses: Ember.inject.controller(),

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {Product} selected product
     */
    product: null,

    /**
     * @property {menuSelected} selected Menu
     */
    menuSelected: "",

    /**
     * @property {assignments} list of assignments by user id
     */
    assignments: null,

    /**
     * @property {SortableHelper|Assignment[]} sortable for assignments
     */
    assignmentsQuizzesSortable: null,

    /**
     * @property {SortableHelper|Assignment[]} sortable for assignments
     */
    mlAssignmentsQuizzesSortable: null,

    /**
     * @property {SortableHelper|Assignment[]} sortable for assignments
     */
    qcAssignmentsQuizzesSortable: null,

    /**
     * @property {SortableHelper|Assignment[]} sortable for assignments Exam
     */
    assignmentsExamsSortable: null,

    autoSubmittedDescription: I18n.t("assignments.autoSubmittedDescription"),

    autoCompletedDescription: I18n.t("assignments.autoCompletedDescription"),


    controllerSetup: function(){
        this.set("assignmentsQuizzesSortable",
            SortableHelper.create({ sort: "dueDate", direction:true }));
        this.set("mlAssignmentsQuizzesSortable",
            SortableHelper.create({ sort: "dueDate", direction:true }));
        this.set("qcAssignmentsQuizzesSortable",
            SortableHelper.create({ sort: "dueDate", direction:true }));

        this.set("assignmentsExamsSortable",
            SortableHelper.create({ sort: "dueDate", direction:true }));
    }.on('init'),

    /**
    * Function return Assignments Quizzes List
    **/
    assignmentsQuizzes: Ember.computed('assignments', function(){
        return this.get("assignments").filter(function(item){
            return  (!item.get("isExamAssignment"));
        });
    }),

    /**
     * Function return Assignments Quizzes List for ML
     **/
    mlAssignmentsQuizzes: Ember.computed('assignments', function(){
        return this.get("assignments").filter(function(item){
            return  item.get("isMasteryLevelAssignment");
        });
    }),

    /**
     * Function return Assignments Quizzes List for question collections
     **/
    qcAssignmentsQuizzes: Ember.computed('assignments', function(){
        return this.get("assignments").filter(function(item){
            return  item.get("isQuestionCollectionAssignment");
        });
    }),

    /**
    * Function return Assignments Exam List
    **/
    assignmentsExams: Ember.computed('assignments', function(){
        return this.get("assignments").filter(function(item){
            return  (item.get("isExamAssignment"));
        });
    }),

    loadAssignments: function(assignments){
        var controller = this;
        controller.set("assignments", assignments);
        var sortableAssignmentQuizzes = controller.get("assignmentsQuizzesSortable");
        var sortableAssignmentExams = controller.get("assignmentsExamsSortable");

        sortableAssignmentQuizzes.set("data", controller.get("assignmentsQuizzes"));
        controller.get("mlAssignmentsQuizzesSortable").set("data", controller.get("mlAssignmentsQuizzes"));
        controller.get("qcAssignmentsQuizzesSortable").set("data", controller.get("qcAssignmentsQuizzes"));
        sortableAssignmentExams.set("data", controller.get("assignmentsExams"));
    },

    /**
     * @properties to create show more details applied ONLY in mobile
     */
    showDetailsQuiz:function(idx, assignment){
        $('#mob-details').remove();
        var dateUtil = new DateUtil();
        var timezone = assignment.get("timeZone");
        var availableDate = dateUtil.format(assignment.get("availableDate"), 'lll', timezone, true);
        var dueDate = dateUtil.format(assignment.get("dueDate"), 'lll', timezone, true);
        var score =  assignment.get("score");
        var points =  assignment.get("points");
        var nQuestions = (assignment.get("isQuestionCollectionAssignment"))? assignment.get("totalQuestions") : "n/a";
        var scorePoints = score + '/' + points;

        //TODO: externalize this html
        if($('[data-arrow-quiz="'+idx+'"]').hasClass('glyphicon-chevron-down')){
            $('[data-arrow-quiz="'+idx+'"]').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
            $('#mob-details').remove();
        }else{
            $('.glyphicon-chevron-down').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
            $('[data-arrow-quiz="'+idx+'"]').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
            var el = $('[data-pos-quiz="'+idx+'"]');
            el.after('<tr id="mob-details" class="visible-xs visible-sm"><td colspan="6"> <div>'+
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.startDate')+
                ':</span> <span class="mDesc">'+ availableDate +'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.dueDate')+
                ':</span> <span class="mDesc">'+ dueDate +'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.nQuestions')+
                ':</span> <span class="mDesc">'+ nQuestions +'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.score')+
                ':</span> <span class="mDesc">'+scorePoints+'</span> </div>' +
                '</div></td></tr>');
        }
    },

    /**
     * @properties to create show more details applied ONLY in mobile
     */
    showDetailsExam:function(idx, assignment){
        $('#mob-details').remove();

        var dateUtil = new DateUtil();
        var timezone = assignment.get("timeZone");
        var availableDate = dateUtil.format(assignment.get("availableDate"), 'lll', timezone, true);
        var masteryLevel =  assignment.get("studentStatus").masteryLevel;

        var promise = assignment.get("exam");

        promise.then(function (exam) {

            var averageTimeOnQuestion =  dateUtil.convertToTimeStringWithFormat(exam.get("averageTimeOnQuestion"), "seconds", "hms");

            //TODO: externalize this html
            if($('[data-arrow-exam="'+idx+'"]').hasClass('glyphicon-chevron-down')){
                $('[data-arrow-exam="'+idx+'"]').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
                $('#mob-details').remove();
            }else{
                $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
                $('[data-arrow-exam="'+idx+'"]').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
                var el = $('[data-pos-exam="'+idx+'"]');
                el.after('<tr id="mob-details" class="visible-xs visible-sm"><td colspan="6"> <div>'+
                    '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.startDate')+
                    ':</span> <span class="mDesc">'+ availableDate +'</span> </div>' +
                    '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.examMastery')+
                    ':</span> <span class="mDesc">'+ masteryLevel+'</span> </div>' +
                    '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.timePerQuestion')+
                    ':</span> <span class="mDesc">'+averageTimeOnQuestion+'</span> </div>' +
                    '</div></td></tr>');
            }
        });
    },

    actions: {
        onSortByCriteria: function(table, criteria){
            var controller = this;
            controller.sortByCriteria(table, criteria);
        },

        showMoreAssignmentQuiz:function(idx, assignment){
            this.showDetailsQuiz(idx, assignment);
        },

        showMoreAssignmentExam:function(idx, assignment){
            this.showDetailsExam(idx, assignment);
        }
    }

});
