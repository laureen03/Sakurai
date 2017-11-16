
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import QuestionPartialMixin from 'sakurai-webapp/mixins/question-partial';
import SortableHelper from 'sakurai-webapp/utils/sortable';


export default Ember.Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin,
    QuestionPartialMixin,
    {

    /**
     * @property {Assignment} selected assignment
     */
    assignment: null,

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {Ember.A} questions
     */
    questions: null,

    /**
     * @property {mixed} contains the selected criteria used to get the results
     */
    criteria: {},

    /**
     * @property hold the page count
     */
    totalResults: null,

    /**
     * @property specified the page size
     */
    pageSize: 25,

    /**
     * @property currentPage
     */
    currentPage: 1,

    /**
     * @properties for modal text
     */
    titlePerformanceModal: I18n.t('assignmentSummary.titlePerformanceModal'),
    bodyPerformanceModal: I18n.t('assignmentSummary.bodyPerformanceModal'),

    /**
     * @property {SortableHelper|StudentResult[]} sortable for assignments
     */
    studentResultsSortable: null,

    controllerSetup: function(){
        this.set("studentResultsSortable",
            SortableHelper.create({ sort: "user.fullName", direction:true }));
    }.on('init'),

    resetValues: function(){
        this.get('studentResultsSortable').set("direction", false);
        this.get('studentResultsSortable').set("sort", "user.fullName");
    },

    loadStudentResults: function(studentResults){
        var sortable = this.get("studentResultsSortable");
        sortable.set("data", studentResults);
    },

    /** <===== QuestionPartialMixin { **/

    /**
     * Enables the class view for question partial
     * @property {bool}
     */
    classView: true,

    /**
     * Disables the links area for question partial
     * @property {bool}
     */
    linksEnabled: false,

    /**
     * Updates the controller with the metadata
     * @param metadata
     */
    updateMetadata: function(metadata){
        var controller = this;
        if (metadata.pagination.totalResults){
            controller.set('totalResults', metadata.pagination.totalResults);
        }
        controller.set('currentPage', parseInt(metadata.pagination.currentPage));
        controller.set('criteria', metadata.criteria);
    },

        /**
         *  Get next 25 Question (search by filters results)
         *  @Param data
         **/
        getPageResults: function(data){
            var controller = this;
            var store = controller.store;
            var page = controller.get('currentPage');

            var queryParams = {
                "productId": controller.get("class").get("product").get("id"),
                "assignmentId":controller.get("assignment").get("id"),
                "referencedClassId" : controller.get("class").get("id"),
                "currentPage" : page + 1
            };

            var result = store.query("question", queryParams);
            result.then(function(questions){
                var metadata = questions.get('meta');
                controller.updateMetadata(metadata);
                controller.get('questions').pushObjects(questions.toArray());
                controller.trigger('asyncLink.restore', data.component);
            });
        },

        /**
         * @property Manage the show more option
         */
        showPaging: Ember.computed("currentPage", "pageSize", "totalResults", function(){
            var currentPage  = this.get('currentPage');
            var pageSize     = this.get('pageSize');
            var totalResults = this.get('totalResults');
            var totalPages   = Math.ceil(totalResults / pageSize);

            if(currentPage >= totalPages){
                return false;
            }

            return true;
        }),


    actions: {
        onSortByCriteria: function(criteria){
            var controller = this;
            controller.sortByCriteria("studentResults", criteria);
        },

        showMoreQuestions: function(data){
            this.getPageResults(data);
        },

        showMore: function(idx, studentResults) {
            var $arrow = $('[data-arrow="'+idx+'"]'),
                el, htmlString;

            $('#mob-details').remove();

            if ( $arrow.hasClass('glyphicon-chevron-up') ) {
                $arrow.removeClass('glyphicon-chevron-up')
                      .addClass('glyphicon-chevron-down');

            } else {
                $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up')
                                          .addClass('glyphicon-chevron-down');

                $arrow.removeClass('glyphicon-chevron-down')
                      .addClass('glyphicon-chevron-up');

                el = $('[data-pos="'+idx+'"]');
                htmlString = '<tr id="mob-details" class="visible-xs" >' +
                                '<td colspan="3">' +
                                    '<div class="mdetails-row">' +
                                        '<span class="mTitle">' + I18n.t('qcAssignmentSummary.studentResultsTable.answered') + ': </span>' +
                                        '<span class="mDesc">' + studentResults.get('questionsAnswered') + '</span>' +
                                    '</div>' +
                                    '<div class="mdetails-row">' +
                                        '<span class="mTitle">' + I18n.t('qcAssignmentSummary.studentResultsTable.correct') + ': </span>' +
                                        '<span class="mDesc">' + studentResults.get('questionsCorrect') + '</span>' +
                                    '</div>' +
                                    '<div class="mdetails-row">' +
                                        '<span class="mTitle">' + I18n.t('qcAssignmentSummary.studentResultsTable.time') + ': </span>' +
                                        '<span class="mDesc">' + studentResults.get('timeToComplete') + '</span>' +
                                    '</div>' +
                                    '<div class="mdetails-row">' +
                                        '<span class="mTitle">' + I18n.t('qcAssignmentSummary.studentResultsTable.answerKeyViews') + ': </span>' +
                                        '<span class="mDesc">' + 0 + '</span>' +
                                    '</div>' +
                                '</td>' +
                            '</tr>';

                el.after(htmlString);
            }
        }
    }
});
