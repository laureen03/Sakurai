
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import DateUtil from 'sakurai-webapp/utils/date-util';
import context from 'sakurai-webapp/utils/context';
import SortableHelper from "sakurai-webapp/mixins/sortable";

export default Ember.Controller.extend(
    ControllerMixin,
    FeatureMixin,{
    headerClasses: Ember.inject.controller(),
    instructor: Ember.inject.controller(),

    instructorController: Ember.computed.alias("instructor"),

    /**
     * @property {Class} the class
     */
    class: null,

    /**
     * @property {StudentUsage[]}
     */
    studentUsage: null,

    /**
     * @property {TermTaxonomyStat} the term taxonomy stats
     */
    termTaxonomyStat: null,

    /**
     * @property {chapterStats} the chapter (nursing topic) stats
     */
    chapterStats: null,

    /**
     * @property {String} Product passing threshold lower limit
     */
    thresholdLowerLimit: 0,

    /**
     * @property {String} Product passing threshold upper limit
     */
    thresholdUpperLimit: 0,

    /**
     * Average mastery level
     * @property {number}
     */
    classAverageMasteryLevel: null,

    /**
     * TODO: move to an individual controller
     * @property {SortableHelper|examAssignmentResults[]} sortable for mastery level assignments
     */
    examAssignmentResultsSortable: null,

    /**
     * TODO: move to an individual controller
     * @property {SortableHelper|StudentUsage[]} sortable for student usage
     */
    studentUsageSortable: null,

    /**
     * if we are showing practiceExamResultsDownload link
     * @property {Bool}
     */
    showPracticeExamResultsDownload: function(){
        return this.showModuleByToggle("practiceExamResultsDownload");
    }.property(),

    /** loading properties */
    studentUsageLoaded: false,
    examAssignmentResultsLoaded: false,
    termTaxonomyStatsLoaded: false,
    chapterStatsLoaded: false,

    controllerSetup: function(){
        this.set("examAssignmentResultsSortable",
            SortableHelper.create({
                sort: "timestampAvailableDate",
                direction:true
            }));

        this.set("studentUsageSortable",
            SortableHelper.create({
                sort: "user.fullName",
                direction:true
            }));
    }.on('init'),

    /**
     * TODO: move to an individual controller
     * Loads the assignment results information if necessary
     */
    initExamAssignmentResults: function(assignments){
        var controller = this,
            examAssignmentResultsSortable = controller.get('examAssignmentResultsSortable');
            examAssignmentResultsSortable.set("data", assignments);
        controller.set("examAssignmentResultsLoaded", true);
    },

    /**
     * TODO: move to an individual controller
     * Loads the studentUsage
     */
    initStudentUsage: function(studentUsage){
        var controller = this,
            studentUsageSortable = controller.get('studentUsageSortable');

        var userPromises = studentUsage.map( function(item) {
            return item.get('user'); //resolve users for sorting
        });

        Ember.RSVP.all(userPromises).then( function() {
            studentUsageSortable.set("data", studentUsage);
        });

        controller.set("studentUsageLoaded", true);
    },

    initTermTaxonomyStat: function(termTaxonomyStats){
        this.set("termTaxonomyStatsLoaded", true);
        this.set("termTaxonomyStat", termTaxonomyStats);
    },

    initChapterStat: function(chapterStats){
        this.set("chapterStatsLoaded", true);
        this.set("chapterStats", chapterStats);
    },

    /**
     * Resets default values
     */
    resetValues: function(){
        this.set("classAverageMasteryLevel", null);
        this.set("studentUsage", null);
        this.get('examAssignmentResultsSortable').set("direction", true);
        this.get('examAssignmentResultsSortable').set("sort", "timestampAvailableDate");
        this.get('studentUsageSortable').set("direction", true);
        this.get('studentUsageSortable').set("sort", "user.fullName");

        this.set("studentUsageLoaded", false);
        this.set("examAssignmentResultsLoaded", false);
        this.set("termTaxonomyStatsLoaded", false);
        this.set("chapterStatsLoaded", false);
    },

    /**
     * @param idx {number}
     * @param assignment {object}
     * @property to create show more details applied ONLY in mobile
     */
    showDetails:function(idx, examAssignment){
        $('#mob-details').remove();
        var assignment = examAssignment.get('assignment');
        var dateUtil = new DateUtil();
        var timezone = examAssignment.get("timeZone");
        var availableDate = dateUtil.format(assignment.get("availableDate"), 'lll', timezone, true);
        var dueDate = dateUtil.format(assignment.get("dueDate"), 'lll', timezone, true);
        var masteryLevel = numeral(examAssignment.get("examAvgMastery")).format('0.00');

        //TODO: externalize this html
        if($('[data-arrow="'+idx+'"]').hasClass('glyphicon-chevron-up')) {
            $('[data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('#mob-details').remove();
        } else {
            $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('[data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            var el = $('[data-pos="'+idx+'"]');
            el.after('<tr id="mob-details" class="visible-xs" ><td colspan="4"> <div>'+
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('practiceExamResults.tableHeader.questions')+
                    ':</span> <span class="mDesc">'+ assignment.get("numberQuestion") +'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.startDate')+
                    ':</span> <span class="mDesc">'+availableDate+'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.dueDate')+
                    ':</span> <span class="mDesc">'+dueDate+'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('practiceExamResults.tableHeader.nComplete')+
                    ':</span> <span class="mDesc">'+examAssignment.get("examsCompleted")+'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('practiceExamResults.tableHeader.avgMastery')+
                    ':</span> <span class="mDesc">'+masteryLevel+'</span> </div>' +
                '</div></td></tr>');
        }
    },

    actions:{
        onSortByCriteria: function(sortableId, criteria){
            var controller = this;
            controller.sortByCriteria(sortableId, criteria);
        },

        openStudentView: function(studentId){
            var controller = this;
            var url = "/student/examReports/" + this.get("class").get("id") + "?studentId=" + studentId;
            var isTesting = context.isTesting();
            var isInFrame = this.get("isInFrame");
            //checking for is testing because it is not possible to open a new window while testing
            if (isTesting || isInFrame){
                controller.transitionToRoute(url);
            }
            else{
                window.open("#" + url, "_blank");
            }
        },

        onPerformanceTaxonomyClick: function(termTaxonomyId){
            var classId = this.get("class").get("id");
            var url = "/instructor/library/results/" + classId + "?termTaxonomyIds=" + termTaxonomyId  + "&classIds=" + classId;
            this.transitionToRoute(url);
        },

        onPerformanceChapterClick: function(chapterId){
            var classId = this.get("class").get("id");
            var url = "/instructor/library/results/" + classId + "?cid=" + chapterId + "&classIds=" + classId;
            this.transitionToRoute(url);
        },

        showMore:function(idx, assignment){
            this.showDetails(idx, assignment);
        },
    }
});
