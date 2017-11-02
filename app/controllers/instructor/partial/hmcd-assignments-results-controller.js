SakuraiWebapp.InstructorPartialHmcdAssignmentsResultsController = Ember.Controller.extend(SakuraiWebapp.ControllerMixin, {
    instructorHmcd: Ember.inject.controller(),
    
    class: Ember.computed.alias("instructorHmcd.class"),
	/**
    * @property {SortableHelper|Assignment[]} sortable for mastery level assignments
    */
    assignmentResultsSortable: null,

    /**
    * @property {SortableHelper|Assignment[]} sortable for question collection assignments
    */
    questionCollectionResultsSortable: null,

    controllerSetup: function(){
    	this.set("assignmentResultsSortable",
            SakuraiWebapp.SortableHelper.create({   sort: "timestampAvailableDate",
                                                    direction:true,
                                                    mandatoryProperty: 'isMasteryLevelAssignment' }));
    	 this.set("questionCollectionResultsSortable",
            SakuraiWebapp.SortableHelper.create({ sort: "timestampAvailableDate",
                                                  direction:true,
                                                  mandatoryProperty: 'isQuestionCollectionAssignment' }));
    }.on('init'),
    	
	/**
     * Loads the assignment results information if necessary
     */
    initQcAssignmentResults: function(assignments){
        var controller = this,
            questionCollectionSortable = controller.get('questionCollectionResultsSortable'),
            masteryLevelSortable = controller.get('assignmentResultsSortable');

        questionCollectionSortable.set("data", assignments);
        masteryLevelSortable.set("data", assignments);
    },

    /* Clean Values */
	resetValues: function(){
		//Assignments ML
		this.get('assignmentResultsSortable').set("direction", false);
        this.get('assignmentResultsSortable').set("sort", "dueDate");
        //Assignments QC
    	this.get('questionCollectionResultsSortable').set("direction", false);
        this.get('questionCollectionResultsSortable').set("sort", "dueDate");
    },

    /**
     * @properties to create show more details applied ONLY in mobile
     * FIXME: when the sorteable tables are refactored, this logic should go
     * inside the component
     */
    showDetails:function(idx, assignment, isQuestionCollectionAssignment){
        $('#mob-details').remove();

        var dateUtil = new SakuraiWebapp.DateUtil();
        var timezone = assignment.get("timeZone");
        var availableDate = dateUtil.format(assignment.get("availableDate"), 'lll', timezone, true);
        var dueDate = dateUtil.format(assignment.get("dueDate"), 'lll', timezone, true);
        var numberCompleted = assignment.get('totalCompleted');
        var expandableRow, el;

        if (!isQuestionCollectionAssignment) {
            expandableRow = $('.assignmentResults-table [data-arrow="'+idx+'"]');

            if(expandableRow.hasClass('glyphicon-chevron-up')){
                expandableRow.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
                $('#mob-details').remove();
            }else{
                $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
                expandableRow.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
                el = $('[data-pos="'+idx+'"]');

                el.after('<tr id="mob-details" class="visible-xs" ><td colspan="4"> <div>' +
                '<div class="mdetails-row"> <span class="mTitle">' + I18n.t('assignments.startDate') +
                ':</span> <span class="mDesc">' + availableDate + '</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">' + I18n.t('assignments.dueDate') +
                ':</span> <span class="mDesc">' + dueDate + '</span> </div>' +
                '</div></td></tr>');
            }
        } else {
            expandableRow = $('.questionCollectionResults-table [data-arrow="'+idx+'"]');

            if(expandableRow.hasClass('glyphicon-chevron-up')){
                expandableRow.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
                $('#mob-details').remove();
            }else{
                $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
                expandableRow.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
                el = $('[data-pos="'+idx+'"]');

                el.after('<tr id="mob-details" class="visible-xs" ><td colspan="4"> <div>' +
                '<div class="mdetails-row"> <span class="mTitle">' + I18n.t('assignments.startDate') +
                ':</span> <span class="mDesc">' + availableDate + '</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">' + I18n.t('assignments.dueDate') +
                ':</span> <span class="mDesc">' + dueDate + '</span> </div>' +
                '</div><div class="mdetails-row"> <span class="mTitle">' + I18n.t('hmcd.assignmentsResults.numCompleted') +
                ':</span> <span class="mDesc">' + numberCompleted + '</span> </div>' +
                '</div></td></tr>');
            }
        }
    },
    
    actions:{
    	onSortByCriteria: function(sortableId, criteria){
            var controller = this;
            controller.sortByCriteria(sortableId, criteria);
        },

        showMore:function(idx, assignment, isQuestionCollectionAssignment){
            this.showDetails(idx, assignment, isQuestionCollectionAssignment);
        }
    }

});