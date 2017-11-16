
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import Assignment from 'sakurai-webapp/models/assignment';
import DateUtil from 'sakurai-webapp/utils/date-utils';


export default Ember.Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin, {

    instructor: Ember.inject.controller(),
    instructorManageAssignment: Ember.inject.controller(),
  	manageAssignment: Ember.computed.alias('instructorManageAssignment'),

    /*------------------------------------------------
	* V A R I A B L E S
    ------------------------------------------------*/
    instructorController: Ember.computed.alias("instructor"),

    /**
     * @property {Assignment} Current Assignment
     */
    assignment: Ember.computed.alias("instructorManageAssignment.assignment"),

    /**
     * @property {boolean} Determine if editing or creating a new assignment
     */
    isEditMode: Ember.computed.alias("instructorManageAssignment.isEditMode"),

    /**
     * @property {boolean} Determine if copying an assignment
     */
    isCopyMode: Ember.computed.alias("instructorManageAssignment.isCopyMode"),

    /**
     * @property {Product} Current Product of the class
     */
    product: Ember.computed.alias("instructorManageAssignment.product"),

    /**
     * @property {Ember.A} alias of current active classes from injected class controller
     */
    activeClasses: Ember.computed.alias("instructor.activeClasses"),

    /**
     * @property {Class} Current Class
     */
    class: Ember.computed.alias("instructorManageAssignment.class"),

    /**
     * @property {bool} Indicates if the assignment is nursing topic
     */
    isTermTaxonomyNursingTopic: Ember.computed.alias("instructorManageAssignment.isTermTaxonomyNursingTopic"),

    /**
     * @property {timezones} array
     */
    timezones: Ember.A(),

    /**
     * @property {date} startDate
     */
    startDate: null,

    /**
     * @property {date} dueDate
     */
    dueDate: null,
    startHour: "8,0",
    dueHour: "8,0",

    /**
     * @property {boolean} boolean of ungraded or not
     */
    ungraded: false,

    /**
     * @property {boolean} autosubmit indicator
     */
    autoSubmit: false,

    /**
     * Indicates when to show the please select a class message
     */
    selectClassMessage: false,

    /**
     * Indicates when the due date the is before the start date
     */
    dueDateBeforeMessage: false,

    /**
        Indicate the class name of the points textField, for edit mode and ungraded.
    **/
    pointClassName: "points",


    /**
        Show all classes in Assignment.
    **/
    classesInAssignment: "",

    /**
     * @property hold the time selected value once
     * the student starts the assignment
     */
    completeInMinutes: null,

    /**
     * @property {QuestionSet} selected question collection
     */
    questionSet: null,

    /**
     * @property {Bool} Flag to show the pencil or not
     */
    activePencil: true,

    /**
     * @property {Bool} Flag to show error when try to edit the name
     */
    nameError: false,

    /**
     * @property {string} selected term taxonomy type, i.e client_needs, nursing_concepts
     */
    selectedTermTaxonomy: Ember.computed.alias("instructorManageAssignment.selectedTermTaxonomy"),

    /**
     * @property {string} term taxonomy label
     */
    termTaxonomyLabel: Ember.computed.alias("instructorManageAssignment.termTaxonomyLabel"),

    /**
     * @property {Ember} array
     */
    customClasses: Ember.A(),

    /**
     * @property {RadioButton} Info
     */
    changeDatesRadio: "keepDates",

    /**
    * @property {Bool} Flag to show the Custom Dates Component
    **/
    changeDatesEnable: false,

    /*-----------------------------------------------
                          I N I T
    _________________________________________________*/

    initController: function () {  // <--- this is just some random name
        this._super();
        Ember.run.schedule("afterRender",this,function() {
            var controller = this;
            var $sliderElement = $(".editable .slider"),
                $slider;

            /*****************************************
            *  Initialize select2 plugin for Hours
            *******************************************/
            $(".custom-select").select2();

            //Init two Datapicker
            controller.initDataPicker();

            //Init Valitator
            controller.initValidatorForm();

            //Init Events for Question Collection Page
            controller.initInAMinuteTimeLimit();

            /**************************************
            Clean Message of Classes
            ***************************************/
            $( ".activeClasses input" ).click(function() {
                controller.set("selectClassMessage", false);
            });

            // Select2 is not reading the value of the select elements.
            // Set the value directly in Select2 (there must a better way to do this)
            $("#startHour").val(controller.startHour).trigger("change");
            $("#dueHour").val(controller.dueHour).trigger("change");


            // Attach event handlers for enabling/disabling editing of
            // certain fields (applies to ML assignments only)
            $().on('click.edit', function(e) {
                if (!$(e.target).closest('.editable.edit').length) {
                    // Any clicks not made within the 'editable' element should restore its state
                    $('.editable.edit').removeClass('edit');
                }
            });

            $('.editable .glyphicon-pencil').on('click', function() {
                $(this).closest('.editable').toggleClass('edit');
            });



            if ($sliderElement.length){
                $slider = $sliderElement.slider({
                    range: "min",
                    min: 1,
                    max: 8,
                    value: $sliderElement.attr('data-value'),
                    slide: function( event, ui ) {
                        Ember.run( function() {
                            controller.set('assignment.targetMasteryLevel', ui.value);
                        });
                    },
                    change: function( event, ui ) {
                        Ember.run( function() {
                            controller.set('assignment.targetMasteryLevel', ui.value);
                        });
                    }
                });

                // and then we can apply pips to it!
                $slider.slider("pips", {
                    first: "pip",
                    last: "pip"
                });
                //Fix the first and last pip according to the wireframes
                $slider.find('.ui-slider-pip-last').css({'left':'99%'});
                $slider.find('.ui-slider-pip-first').css({'left':'1%'});
            }

            if (controller.get("isEditMode")) {
                //Check if the assignment have timeLimit, enable the input
                var input = $("#completeInMinutes");
                input.prop('disabled', ($('#completeInMinutesRadio').prop("checked") ? false : true));
            }
        });
    },


    initInAMinuteTimeLimit: function(){
        $( "#assign-a-quiz-step3" ).on( "click", "#completeInMinutesRadio", function() {
            var input = $("#completeInMinutes");
            input.prop('disabled', false);
            input.focus();
        });

        $( "#assign-a-quiz-step3" ).on( "click", "#noTimeLimitRadio", function() {
            var input = $("#completeInMinutes");
            input.prop('disabled', true);
            input.val("");
            input.valid();
        });
    },


    initValidatorForm: function(){

        $.validator.addMethod(
            "regex",
            function(value, element, regexp) {
                var re = new RegExp(regexp);
                return re.test(value);
            },
            I18n.t('assignQuiz.pointValueError.regex')
        );

        $.validator.addMethod(
            "dateCheck",
            function() {
                var start = $('#startDate').val(),
                    end = $('#dueDate').val();
                if (start === undefined || (end === undefined)){
                    return true; //If Element are missing don't show error
                }
                else{
                    if(start !== '' && end !== ''){
                        return new Date(start) <= new Date(end);
                    }
                    return true;
                }
            },
            "Available date cannot be past due date."
        );

        $("#assign-a-quiz-step3").validate({
            onsubmit: false,
            onkeyup: function(element) { $(element).valid(); },
            errorPlacement: function(error, element) {
                if (element.attr("name") === "completeInMinutes") {
                    error.insertAfter($(element).parent());
                } else {
                    error.insertAfter(element);
                }
            },
            rules: {
                nameEdited: {
                    required: true,
                    maxlength: 50
                },
                points: {
                    required: true,
                    regex: /^\d{1,3}(\.\d{1,2})?$/
                },
                startDate: {
                    required: true,
                    dateCheck: true
                },
                dueDate:{
                    required: true,
                    dateCheck: true
                },
                completeInMinutes:{
                    required: {
                        depends: function() {
                            return $("#completeInMinutesRadio:checked").length > 0;
                        }
                    },
                    regex: {
                        depends: function() {
                            var formatOk = /^[1-9]{1}([0-9]{1,2})?$/.test($("#completeInMinutes").val());
                            var checked = $("#completeInMinutesRadio:checked").length > 0;
                            return checked && !formatOk;
                        }
                    }
                }
            },
            messages: {
                nameEdited: {
                    required: I18n.t('assignQuiz.assignmentNameErrors.required'),
                    maxlength: I18n.t('assignQuiz.assignmentNameErrors.max')
                },
                points: {
                    required: I18n.t('assignQuiz.pointValueError.required'),
                    regex: I18n.t('assignQuiz.pointValueError.regex')
                },
                startDate: {
                    required: I18n.t('assignQuiz.availableOnValue.required'),
                    dateCheck: I18n.t('assignQuiz.availableOnValue.dateCheck')
                },
                dueDate:{
                    required: I18n.t('assignQuiz.dueOnValue.required'),
                    dateCheck: I18n.t('assignQuiz.dueOnValue.dateCheck')
                },
                completeInMinutes:{
                    required: I18n.t('assignQuiz.completeInMinutes.required'),
                    regex: I18n.t('assignQuiz.completeInMinutes.regex')
                }

            }
        });
    },

    /*------------------------------------------------
    * P R O P E R T I E S
    ------------------------------------------------*/
    /**
     * computed property watches class property so we can derive the product id and get the correct
     * classes when we switch classes
     * @property {computed property} My active classes for the current product
     */
    myClasses: Ember.computed('product', 'activeClasses.[]', function(){
        var productId = this.get('product').get('id');
        var instructorController = this.get("instructorController");
        return instructorController.getActiveClassesByProduct(productId);
    }),

    /**
     * Total assignment questions
     * @property {number}
     */
    assignmentTotalQuestions: Ember.computed("assignment.totalQuestions", "questionSet.totalQuestions", function(){
        var controller = this;
        return (controller.get("isEditMode")) ?
                    controller.get("assignment.totalQuestions") :
                    controller.get("questionSet.totalQuestions");
    }),

    /**
     * Display Staggered Option if has many classes
     * @property {Bool}
     */
    hasManyClasses: Ember.computed('customClasses.[]', function(){
        var length = this.get("customClasses").length;
        if (length <= 1){
            this.set("changeDatesRadio", "keepDates");
        }
        return (length > 1);
    }),

    /**
     * Indicates when the assignment has started
     */
    isAssignmentCompleted: Ember.computed("assignment", "isEditMode", function(){
        var controller = this;
        return (controller.get("isEditMode")) && (controller.get("assignment.hasBeenCompletedAtLeastOnce"));
    }),

    /**
     * Indicates when the assignment has started
     */
    isAssignmentStarted: Ember.computed("assignment", "isEditMode", function(){
        var controller = this;
        return (controller.get("isEditMode")) && !controller.get("isCopyMode") && ((controller.get("assignment").get("isStarted")) || (controller.get("assignment.hasBeenCompletedAtLeastOnce")));
    }),

    /**
        Verify if the user can edit the point or not
    **/
    enablePoints: Ember.computed("isAssignmentStarted", "isAssignmentCompleted", "isCopyMode", function(){
        var controller = this,
            canEditPoints;

        if(controller.get("isCopyMode")) {
            canEditPoints = true;
        } else {
            if (this.get("assignment.isQuestionCollectionAssignment")){
                canEditPoints = !controller.get("isAssignmentCompleted");
            }
            else{
                canEditPoints = !controller.get("isAssignmentStarted");
            }

            canEditPoints = !controller.get("assignment.hasPassedDueDate");
        }

        if (!canEditPoints){
            controller.set("pointClassName", "points disabled");
        }
        return canEditPoints;
    }),

    /**
        Verify if the user can edit the limit
    **/
    disableTimeLimit: Ember.computed("assignment", "isEditMode", function(){
        var controller = this;
        return controller.get("isAssignmentStarted");
    }),


    hasNoTimeLimit: Ember.computed('assignment', function(){
        return !this.get("assignment").get("hasTimeLimit");
    }),

    /**
     * @property hold the point value
     */
    pointCalculation: Ember.computed('assignment.points','questionSet.totalQuestions', function(){
        if (this.get('questionSet')){
            var assignments     = this.get("assignment");
            var points          = assignments.get('points');
            points = ($.isNumeric(points)) ? points : 0;
            var questions       = this.get('questionSet').get("totalQuestions");
            var math            = points/questions;
            return math.toFixed(2);
        }
        return 0;
    }),

    showStaggeredOptions: Ember.computed(function(){
        return this.showModuleByToggle("staggeredAssignment");
    }),

    isMLReadOnly: Ember.computed(function(){
        return ((this.get('isAssignmentStarted')) || (this.get("isEditMode")));
    }),

    timeList: Ember.computed(function(){
        return Assignment.availableHoursList();
    }),
    /*------------------------------------------------
	* O B S E R V E S
    ------------------------------------------------*/
    /**
     * Check disable points input if ungraded checkbox is checked
     */
    checkUngraded: Ember.observer('ungraded', function(){
        var controller = this;
        if(controller.get("ungraded")){
            controller.get('assignment').set('points', 0);
            controller.set("pointClassName", "points disabled");
        }
        else{
            controller.get('assignment').set('points', 100);
            controller.set("pointClassName", "points");
        }
    }),

    /**
     * Check the radio Buttons for Custom Dates
     */
    listenDateRadio: Ember.observer('changeDatesRadio', function(){
        var controller = this;
        if (controller.get("changeDatesRadio") === "changeDates"){
            controller.set("changeDatesEnable", true);
            if (controller.get("assignment.isQuestionCollectionAssignment")){
                Ember.run.later((function () {
                    $('.custom-dates:eq(0) .whatisthis').show();
                }), 100);
            }
        }
        else{
            controller.set("changeDatesEnable", false);
            Ember.run.later((function () {
                controller.initDataPicker();
            }), 100);
        }
    }),

    /*------------------------------------------------
	* M E T H O D S
    ------------------------------------------------*/
    resetValues: function(){
        var controller = this;
        //sets the assignment to an empty object, so the original assignment won't be affected by the observers
        controller.set("assignment", Ember.Object.create({}));
        controller.set("ungraded", false);
        controller.set("autoSubmit", false);
        controller.set("pointClassName", "points");
        controller.set("selectClassMessage", false);
        controller.set("dueDateBeforeMessage", false);
        controller.set("classesInAssignment", "");
        controller.set("activePencil", true);
        controller.set("nameError", false);
        controller.get("customClasses").clear();
        controller.set("changeDatesRadio", "keepDates");
        controller.set("changeDatesEnable", false);
    },

    /**
     * Init Initial values of Step 3
     * @param {QuestionSet} questionSet
     */
	initStep3: function(questionSet){
		var controller = this,
			dateUtil = new DateUtil(),
			availableDate = new Date(),
			dueDate = new Date(),
			assignment = this.get("assignment");

        //Set Number of question if is a QC Assignment
        if (assignment.get("isQuestionCollectionAssignment")){
            assignment.set("questionSet", questionSet);
            controller.set("questionSet", questionSet);
            controller.set("completeInMinutes", "");
        }

		// Set due date to be a week from today
		dueDate.setDate(dueDate.getDate()+7);

		var timeZone = DateUtil.getLocalTimeZone();

		assignment.set('points', '100');
		assignment.set('timeZone', timeZone);
		assignment.set('autoSubmit', assignment.get("autoSubmit"));

		controller.set('timezones', DateUtil.getTimeZones());
		//converting to assignment timezone
		controller.set("startDate", dateUtil.format(availableDate, dateUtil.slashedShortDateFormat, timeZone));
		controller.set("dueDate", dateUtil.format(dueDate, dateUtil.slashedShortDateFormat, timeZone));

		controller.set('startHour', "08,00");
		controller.set('dueHour', "08,00");

		$("#startHour").val(this.get("startHour")).trigger("change");
		$("#dueHour").val(this.get("startHour")).trigger("change");

        $('#startDate').datepicker('update', new Date());

        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        $('#dueDate').datepicker('update', dueDate);

        var $sliderElement = $(".editable .slider"),
            $slider;

        if ($sliderElement.length){
            $slider = $sliderElement.slider({
                range: "min",
                min: 1,
                max: 8,
                value: $sliderElement.attr('data-value'),
                slide: function( event, ui ) {
                    Ember.run( function() {
                        controller.set('assignment.targetMasteryLevel', ui.value);
                    });
                },
                change: function( event, ui ) {
                    Ember.run( function() {
                        controller.set('assignment.targetMasteryLevel', ui.value);
                    });
                }
            });

            // and then we can apply pips to it!
            $slider.slider("pips", {
                first: "pip",
                last: "pip"
            });
            //Fix the first and last pip according to the wireframes
            $slider.find('.ui-slider-pip-last').css({'left':'99%'});
            $slider.find('.ui-slider-pip-first').css({'left':'1%'});
        }
	},

	/**
	* Gets selected classes
	* @returns {Class[]} classes
	*/
    getSelectedClasses: function () {
		var controller = this;
        var ids = $(".activeClasses input:checked").map(function () {
            return $(this).val();
        });
        var instructorController = controller.get("instructorController");
        return instructorController.getClassesByIds(ids);
    },

    /*
        Set assignment if is Edit Mode
     */
    setAssignment: function(assignment) {
        var controller = this, availableDate = null, dueDate = null, timeZone = null; 
        controller.set("isEditMode", true);
       // controller.set("isCopyMode", controller.get("instructorManageAssignment").get("isCopyMode"));
        if(controller.get("isCopyMode")) {
            availableDate = new Date();
            dueDate = new Date();

            dueDate.setDate(dueDate.getDate()+7);
            timeZone = DateUtil.getLocalTimeZone();
            assignment.set('timeZone', timeZone);
            controller.set('startHour', "08,00");
            controller.set('dueHour', "08,00");

        } else {
            var availableHourStr, dueHourStr;

            availableDate = assignment.get("availableDate");
            dueDate = assignment.get("dueDate");

            timeZone = assignment.get("timeZone");
            // Extract hour values and change them to format expected by select field i.e. "hh,mm"

            availableHourStr = DateUtil.format(assignment.get("availableDateRound"), "HH,mm", timeZone);
            dueHourStr = DateUtil.format(assignment.get("dueDateRound"), "HH,mm", timeZone);

            controller.set('startHour', availableHourStr);
            controller.set('dueHour', dueHourStr);
        }

        controller.set('timezones', DateUtil.getTimeZones());
        //converting to assignment timezone
        controller.set("startDate", DateUtil.format(availableDate, DateUtil.slashedShortDateFormat, timeZone));
        controller.set("dueDate", DateUtil.format(dueDate, DateUtil.slashedShortDateFormat, timeZone));

        controller.set("assignment", assignment);
        if (assignment.get("isQuestionCollectionAssignment")){
            if (assignment.get("questionSet").get("content")){
                controller.set("questionSet", assignment.get("questionSet"));
            }
            controller.set("autoSubmit", assignment.get("autoSubmit"));
        }
        controller.set("completeInMinutes", assignment.get("hasTimeLimit") ? assignment.get("timeLimit") : "");

        //Set if is ungraded Assignment
        controller.set("ungraded", assignment.get("isUngraded"));

        //Set Classes Selected
        assignment.get("classes").then(function(classes){
            classes.map(function(clazz){
                clazz.get('product'); //load products from sideload
            });
            controller.set("classesInAssignment", classes.mapBy("id").join("-"));
        });
    },

    getDatesInfo: function(){
        var controller = this;
        var myAssignment = controller.get("assignment"),
            datesOk = true,
            customDataByClass = [],
            autoSubmit = false, dueHour, startHour, dueDate, startDate, timeZone;

        controller.get("customClasses").forEach(function (clazz) {
                timeZone = $('#datesClass'+clazz.id +' #secondTimeZone'+clazz.id).data("timezone");
                startDate = $('#datesClass'+clazz.id+' .startDate').val();
                dueDate = $('#datesClass'+clazz.id+' .dueDate').val();
                startHour = $('#datesClass'+clazz.id+' .startHour').val();
                dueHour = $('#datesClass'+clazz.id+' .endHour').val();
                autoSubmit = false;

            if (myAssignment.get('isQuestionCollectionAssignment')){
                autoSubmit = $('#autoSubmit'+clazz.id).prop('checked');
            }

            var date = startDate + " " + startHour;
            //dates are handle in local time, they are converted to UTC before sending the request
            startDate = DateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

            date = dueDate + " " + dueHour;
            //dates are handle in local time, they are converted to UTC before sending the request
            dueDate = DateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

            datesOk = moment(startDate).isBefore(moment(dueDate));

            var obj = {
                "idClass" : clazz.get("id"),
                "availableDate"  : startDate,
                "dueDate" : dueDate,
                "timeZone" : timeZone,
                "autoSubmit": autoSubmit
                };

            if (datesOk){
               customDataByClass.push(obj);
            }
            else{
                $("#error-dates-"+clazz.id).removeClass("hide");
            }
        });
        myAssignment.set("customDataByClass", JSON.stringify(customDataByClass));
    },

    setCustomDatesInfo: function(startDate, startHour, dueDate, dueHour){
        var controller = this;
        var myAssignment = controller.get("assignment"),
            datesOk = true,
            customDataByClass = [],
            timeZone = myAssignment.get("timeZone"),
            autoSubmit = false;

        if (myAssignment.get('isQuestionCollectionAssignment')){
            autoSubmit = controller.get("autoSubmit");
        }

        var date = startDate + " " + startHour;
        //dates are handle in local time, they are converted to UTC before sending the request
        startDate = DateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

        date = dueDate + " " + dueHour;
        //dates are handle in local time, they are converted to UTC before sending the request
        dueDate = DateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

        datesOk = moment(startDate).isBefore(moment(dueDate));

        controller.get("customClasses").forEach(function (clazz) {
            var obj = {
                "idClass" : clazz.get("id"),
                "availableDate"  : startDate,
                "dueDate" : dueDate,
                "timeZone" : timeZone,
                "autoSubmit": autoSubmit
                };

            if (datesOk){
               customDataByClass.push(obj);
            }
        });
        if (datesOk) {
            myAssignment.set("customDataByClass", JSON.stringify(customDataByClass));
            myAssignment.set("availableDate", startDate);
            myAssignment.set("dueDate", dueDate);
            myAssignment.set("timeZone", timeZone);
            myAssignment.set("autoSubmit", autoSubmit);
        }
        return datesOk;
    },

    initDataPicker: function(){
        /*****************************************
        *  Initialize Date picker and validation
        *******************************************/
        var nowTemp = new Date();
        var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

        var checkout = $('#dueDate').datepicker({
            onRender: function(date) {
                return date.valueOf() <= checkin.getDate().valueOf() ? 'disabled' : '';
            }
        }).on('changeDate', function(ev) {
            if (ev.date != null && (ev.date.valueOf() < checkin.getDate().valueOf())) {
                var newDate = new Date(ev.date);
                newDate.setDate(newDate.getDate() - 1);
                checkin.setDate(newDate);
                checkin.show();
            }
            checkout.hide();
            $(this).validate();
        }).data('datepicker');

        var checkin = $('#startDate').datepicker({
            onRender: function(date) {
                return date.valueOf() < now.valueOf() ? 'disabled' : '';
            }
        }).on('changeDate', function(ev) {

            if (ev.date != null && (ev.date.valueOf() > checkout.getDate().valueOf())) {
                var newDate = new Date(ev.date);
                newDate.setDate(newDate.getDate() + 1);
                checkout.setDate(newDate);
            }
            checkin.hide();
            checkout.show();
            $(this).validate();
        }).data('datepicker');
    },

    actions:{
    	setTimeZone: function(timezone){
            this.get("assignment").set("timeZone", timezone);
        },

    	saveAssignment: function(data){
    		var controller = this;
    		var myAssignment = controller.get("assignment");
    		var selectedClasses = controller.getSelectedClasses();

            var hasClasses = true;

            if(controller.get("isEditMode") && myAssignment.get("staggered") === true && !controller.get("isCopyMode")){
                hasClasses = (myAssignment.get("classes").get("length") > 0);
            }else{
                hasClasses = (selectedClasses.get("length") > 0);
            }

            var validationOk = ($("#assign-a-quiz-step3").valid() && hasClasses);
            controller.set("selectClassMessage", !hasClasses);

            if (validationOk) {
                var datesOk = true;
                if (controller.get("changeDatesRadio") === "changeDates") {
                    controller.getDatesInfo();
                    myAssignment.set("staggered", true);
                }else{

                    if((!controller.get('isEditMode') && controller.get("showStaggeredOptions")) || controller.get("isCopyMode")) {
                        datesOk = controller.setCustomDatesInfo(
                                    controller.get("startDate"),
                                    controller.get("startHour"),
                                    controller.get("dueDate"),
                                    controller.get("dueHour")
                                  );
                    } else {
                        datesOk = myAssignment.setDates(
                            controller.get("startDate"),
                            controller.get("startHour"),
                            controller.get("dueDate"),
                            controller.get("dueHour")
                        );
                    }

                    myAssignment.set("staggered", controller.get("showStaggeredOptions"));
                    controller.set("dueDateBeforeMessage", !datesOk);
                }

                if (datesOk){
                    if (myAssignment.get("isQuestionCollectionAssignment")){
                        myAssignment.set("autoSubmit", controller.get("autoSubmit"));
                        myAssignment.set("answerKeyView", $('.qc-step3 input[name=answerKey]:checked').val());
                        var selectedStartAssignment = $('.qc-step3 input[name=startA]:checked').val();
                        var timeLimit = (selectedStartAssignment === 'starts-at') ? controller.get('completeInMinutes') : 0;
                        myAssignment.set("timeLimit", timeLimit);
                    }

                    if(controller.get("isEditMode") && myAssignment.get("staggered") === true && !controller.get("isCopyMode")){
                        controller.get("manageAssignment").saveAssignment(myAssignment);
                    }else{
                        var promise = myAssignment.get('classes');
                        promise.then(function(classes){
                            classes.clear();
                            selectedClasses.forEach(function (clazz) {
                                classes.pushObject(clazz);
                            });

                            controller.get("manageAssignment").saveAssignment(myAssignment);
                        });
                    }
                }else{
                    controller.trigger('asyncButton.restore', data.component);
                }
            }else{
                controller.trigger('asyncButton.restore', data.component);
            }
    	},

    	checkClasses: function(id){
    		this.set("selectClassMessage", false);
    		$("#check"+id).prop("checked", !$("#check"+id).prop("checked"));
    	},

    	goBackStepTwo: function(){
            $('#points-error').css("display", "none");
            $('#completeInMinutes-error').css("display", "none");

            // Clear selected classes
            $('.activeClasses input').attr('checked', false);

            // Reset radio buttons (first option selected)
            $('input[name="startA"]:first').prop('checked', true);
            $('input[name="answerKey"]:first').prop('checked', true);

            this.set("selectClassMessage", false);
            this.set("changeDatesEnable", false);
            this.get("customClasses").clear();
            this.get("manageAssignment").changeStepSelected("3", "2");
        },

        editQCAssignment: function(){
            this.set("activePencil", false);
        },

        showPencil: function(){
            var controller = this;
            if (controller.get("assignment.name").length > 0 && controller.get("assignment.name").length < 51){
                controller.set("activePencil", true);
                controller.set("nameError", false);
            }else{
                controller.set("nameError", true);
            }
        },

        selectClass: function(clazz){
            var controller = this;
            if ($("#check"+clazz.get("id")).prop("checked")){ //Add to the list of classes
                controller.get("customClasses").pushObject(clazz);
            }else{
                var indexClass = controller.get("customClasses").indexOf(clazz);
                if (indexClass > -1) {
                    controller.get("customClasses").removeAt(indexClass, 1);
                }
            }
        }
    }
});
