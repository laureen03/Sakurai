import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import SortableHelper from "mixins/sortable";
import Assignment from 'models/assignment';
import DateUtil from 'utils/date-util';


export default Controller.extend(
    ControllerMixin,
    FeatureMixin,{
    queryParams: ['prevPage'],
    prevPage: 'hmcd',
    isPrevHMCD: Ember.computed('prevPage', function(){
        var prevPage = this.get('prevPage');
        if(prevPage === 'hmcd') {
            return true;
        } else {
            return false;
        }
    }),
    headerClasses: Ember.inject.controller(),

    /**
     * @property {Class} selected class
     * TODO: This is needed by assignQuiz. It will need to be removed.
     */
    classId: null,

    /**
     * @property {Product} selected product
     */
    product: null,

    /**
     * @property {menuSelected} selected Menu
     */
    menuSelected: "",

    /**
     * @property {SortableHelper|Assignment[]} sortable for assignments
     */
    assignmentsSortable: null,

    /**
     * property holds the assignment name
     */
    selectedAssignmentName: null,

    /**
     * property holds the assignment name
     */
    selectedAssignmentId: null,

    /**
     * List of selected assginments to copy
     * @property {Ember} array
     */
    copyAssignments: Ember.A(),

    controllerSetup: function(){
        this.set("assignmentsSortable",
            SortableHelper.create({ sort: "dueDate", direction:false }));
    }.on('init'),

    /**
     * update tooltip when assignments are selected
     */
    checkboxHoverTitle: Ember.observer('copyAssignments.[]', function(){
        var controller = this;
        controller.get("assignmentsSortable").get("collection").forEach(function(item){
            $("#check"+item.get("id")).parent().attr("title", ($("#check"+item.get("id")).prop("checked") || controller.get("copyAssignments").length > 1) ? "" : I18n.t("assignments.checkboxhover"));
        });
    }),

    /**
     * Enable Continue button if any copy assignment is selected
     * @property {Bool}
     */
    hasCopyAssignments: Ember.computed('copyAssignments.[]', function(){
        return this.get("copyAssignments").length > 0;
    }),

    /**
     * if we are showing the copy options
     * @property {Bool}
     */
    showCopyOptions: Ember.computed(function(){
        return this.showModuleByToggle("copyAssignments");
    }),

    goBackClass: Ember.computed('showCopyOptions', function(){
        return this.get('showCopyOptions') ? 'go-back' : 'btn btn-blue';
    }),


    resetValues: function(){
        this.get('assignmentsSortable').set("direction", false);
        this.get('assignmentsSortable').set("sort", "dueDate");
        this.get("copyAssignments").clear();
    },

    loadAssignments: function(assignments){
        var sortable = this.get("assignmentsSortable");
        sortable.set("data", assignments);
    },

    /**
     * @param idx {number}
     * @param assignment {object}
     * @property to create show more details applied ONLY in mobile
     */
    showDetails:function(idx, assignment){
        $('#mob-details').remove();

        var dateUtil = new DateUtil();
        var timezone = assignment.get("timeZone");
        var availableDate = dateUtil.format(assignment.get("availableDate"), 'lll', timezone, true);
        var dueDate = dateUtil.format(assignment.get("dueDate"), 'lll', timezone, true);

        //TODO: externalize this html
        if($('[data-arrow="'+idx+'"]').hasClass('glyphicon-chevron-up')){
            $('[data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('#mob-details').remove();
        }else{
            $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('[data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            var el = $('[data-pos="'+idx+'"]');
            el.after('<tr id="mob-details" class="visible-xs" ><td colspan="4"> <div>'+
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.type')+
                    ':</span> <span class="mDesc">'+ assignment.get("type") +'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.startDate')+
                    ':</span> <span class="mDesc">'+availableDate+'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('assignments.dueDate')+
                    ':</span> <span class="mDesc">'+dueDate+'</span> </div>' +
                '</div></td></tr>');
        }
    },


    /**
     * @property sets the remove assignment title
     */
    deleteAsHeader: Ember.computed('selectedAssignmentName', function(){
        return I18n.t('assignments.removeModal.title') + ' ' + this.get('selectedAssignmentName') + '?';
    }),



    /**
     * @method soft delete assignment
     */
    removeAssignment:function(){
        var controller = this;
        var id = controller.get('selectedAssignmentId');

        var collection = this.get("assignmentsSortable").get("collection");
        var assignments = collection.filterBy('id', id);

        Assignment.fetch(assignments.nextObject(0)).then(function(assignment){
            assignment.set('deleted', true);
            assignment.save().then(function(){
                var sortable = controller.get("assignmentsSortable"),
                    updatedData;

                updatedData = sortable.get('data').filter( function(item) {
                    // filter out the element with the id selected
                    return item.get('id') !== id;
                });

                sortable.set('data', updatedData);
                $('#deleteAssignment-mdl').modal('hide');
            }, function(reason){
                $('#deleteAssignment-mdl').modal('hide');
                controller.send('error', {
                    reason: reason,
                    i18nCodes : {
                        "cannot_modify_demo_data" : "error.assignments.canNotDeleteDemoAssignment"
                    }
                });
            });
        });
    },


    actions: {
        onSortByCriteria: function(criteria){
            var controller = this;
            controller.sortByCriteria("assignments", criteria);
        },

        showMore:function(idx, assignment){
            this.showDetails(idx, assignment);
        },

        showDeleteModal: function(assignmentId, assignmentName){
            this.set("selectedAssignmentName",assignmentName);
            this.set("selectedAssignmentId",assignmentId);
            $('#deleteAssignment-mdl').modal('show');
        },

        removeAssignment: function(){
            this.removeAssignment();
        },

        editAssignment: function(id, isExam){
            var controller= this;
            if (!isExam){
                controller.transitionToRoute("/instructor/manageAssignment/" + controller.get("classId") + "/" + id);
            }
            else{
                controller.transitionToRoute("/instructor/assignExam/" + controller.get("classId") + "?assignmentId=" + id);
            }
        },

        selectAssignment: function(assignment){
            var controller = this;
            if ($("#check"+assignment.get("id")).prop("checked")) {
                controller.get("copyAssignments").pushObject(assignment);
            } else{
                var indexAssignment = controller.get("copyAssignments").indexOf(assignment);
                if (indexAssignment > -1) {
                    controller.get("copyAssignments").removeAt(indexAssignment, 1);
                }
            }
        },

        copyAssignment: function(){
            var controller = this;
            var copyAssignments = controller.get("copyAssignments");
            if(copyAssignments.length === 1) {
                // TO-DO if there is only one assignment selected
                var assignment = copyAssignments.objectAt(0);
                if (!assignment.get("isExamAssignment")){
                    controller.transitionToRoute("/instructor/manageAssignment/" + controller.get("classId") + "/" + assignment.get("id") + "?action=copy");
                }
                else{
                    controller.transitionToRoute("/instructor/assignExam/" + controller.get("classId") + "?assignmentId=" + assignment.get("id") + "&action=copy");
                }
            } else {
                // TO-DO if there are multiple assignments selected
                var ids =  copyAssignments.map(function(assignment){
                    return assignment.id;
                });
                controller.transitionToRoute("/instructor/copyAssignments/" + controller.get("classId") + "?assignmentIds=" + ids);
            }
        }
    }

});
