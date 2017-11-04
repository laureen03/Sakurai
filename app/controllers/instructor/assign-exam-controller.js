import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import DateUtil from 'utils/date-util';
import Assignment from 'models/assignment';

export default Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin,{
    queryParams: ['assignmentId', 'action'],
    headerClasses: Ember.inject.controller(),
    instructor: Ember.inject.controller(),

    instructorController: Ember.computed.alias("instructor"),

    /**
     * @property indicates if need edit an assignment
     */
    assignmentId: null,

    /**
     * @property indicates if need to copy this assignment
     */
    action: null,

    /**
     * @property {Class} the class
     */
    class: null,

    /**
     * @property {Product} the class
     */
    product: null,

    /**
     * @property {Assignment} the assignment
     */
    assignment: null,

    /**
     * Indicates when to show the please select a class message
     */
    selectClassMessage: false,

    /**
     * List of Number of question the user can choose for exam
     * @property []
     **/
    numQuestions: null,

    /**
     * List of Nclex proficiency threshold level the user can choose for exam
     * @property []
     **/
    nclexProficiencyLevels: null,

    /**
     * List of Minutes for Time Limit the user can choose for exam
     * @property [] product minutes limit
     **/
    minutesLimit: null,

    /**
     * @property [] minutes limit list for select element
     */
    minutesLimitList: Ember.A(),

    classExamOverallSettings :null,

    classHideThresholdLabels: null,

    classCustomThreshold: null,

    assignmentCustomThreshold: null,

    /**
     * Indicate first Num Question option
    **/
    numQuestion: Ember.computed('numQuestions', function(){
        return this.get("numQuestions")[0];
    }),

    /**
     * Get the minimum threshold Proficiency for the current assignment
     **/
    minimumThreshold: Ember.computed("class", "classExamOverallSettings", function(){
        var controller = this;
        if(controller.get("classExamOverallSettings").get("customThreshold")) {
            return controller.get("classExamOverallSettings").get("customThreshold");
        } else {
            return controller.class.get("product").get("passingThreshold");
        }
    }),

    enableAssignmentTargetMastery: Ember.computed('assignment.targetMasteryLevel', 'assignment.hideThresholdLabels', function(){
        var assignment = this.get("assignment");
        if (((assignment.get("id") || this.get("isCopyMode")) && assignment.get("targetMasteryLevel") > 0) && !assignment.get('hideThresholdLabels')) {
            return true;
        }
        return false;
    }),

        /**
     * Get the default minimum threshold for the class otherwise return the default threshold for the product
     */
    defaultMinimumThreshold: Ember.computed('class', 'classExamOverallSettings', function(){
        if(this.get("classExamOverallSettings").get("customThreshold")) {
            return this.get("classExamOverallSettings").get("customThreshold");
        }
        return this.class.get("product").get("passingThreshold");
    }),

    /**
     * @property {String} Return text for What's this? Number of Question
     */
    numberQuestionDescription: Ember.computed('product.name', function(){
        /*The name of the product, is the same of the label in the Translations file, because only two products
        allow exams, but if in the future another message needs to hardcode another label is better create a
        property into the product*/
        var name = this.get("product.name").replace(/-/g, "");
        return I18n.t("assignExam." + name + ".numberQuestionDescription");
    }),

    /**
     * @property {String} Return text for What's this? Time Limit
     */
    timeLimitDescription: Ember.computed('product.name', function(){
        /*The name of the product, is the same of the label in the Translations file, because only two products
        allow exams, but if in the future another message needs to hardcode another label is better create a
        property into the product*/
        var name = this.get("product.name").replace(/-/g, "");
        return I18n.t("assignExam." + name + ".timeLimitDescription");
    }),

        /**
     * @property {String} Return text for What's this? Auto shutoff
     */
    autoShutoffDescription: Ember.computed("product.name", function(){
        /*The name of the product, is the same of the label in the Translations file, because only two products
        allow exams, but if in the future another message needs to hardcode another label is better create a
        property into the product*/
        var name = this.get("product.name").replace(/-/g, "");
        return I18n.t("assignExam." + name + ".autoShutoffDescription");
    }),

    /**
    * Available list of hours
    **/
    timeList: Ember.computed(function(){
        return Assignment.availableHoursList();
    }),

    /**
     *    Create a list of index available to order the questions.
     **/
    loadMinutesLimitList: Ember.observer('minutesLimit.[]', function(){
        var controller = this;
        var dateUtil = new DateUtil();
        var minutesLimitList = controller.get("minutesLimitList");
        minutesLimitList.clear();
        controller.get("minutesLimit").forEach(function(minutes){
            minutesLimitList.pushObject({"value": minutes , "label": dateUtil.convertToTimeStringWithFormat(minutes, "minutes", "HM")});
        });
    }),

    onAutoShutoffChange: Ember.observer('assignment.autoShutoff', function () {
        var assignment = this.get('assignment');
        var minutesLimit = this.get("minutesLimit");
        var numQuestions = this.get("numQuestions");
        if (assignment.get('autoShutoff')) {
            $('.assign-exam-form #timeLimitRadio').prop('checked', true);
            $('.assign-exam-form #autoShutoffYes').prop('checked', true);
            assignment.set('timeLimit', minutesLimit[minutesLimit.length - 1]);
            assignment.set('numberQuestion', numQuestions[numQuestions.length - 1]);
            this.set('selectedClass', 'disabled');
            $("#minutes_limit").addClass('disabled');
        } else {
            if(!assignment.get('isStarted')) {
                this.set('selectedClass', false);
            }
            if(!assignment.get('numberQuestion')) {
                assignment.set('numberQuestion', numQuestions[0]);
            }

            $('.assign-exam-form #noTimeLimitRadio').prop('checked', true);
            $('.assign-exam-form #autoShutoffNo').prop('checked', true);
        }
    }),

    /**
     * @property [] timezones
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

    /**
     * @property {string} start hour
     */
    startHour: "8,0",

    /**
     * @property {string} due hour
     */
    dueHour: "8,0",

    /**
     * Indicates when the due date the is before the start date
     * @property {bool}
     */
    dueDateBeforeMessage: false,

    /**
     * @property {bool} indicates when the assignment was created
     */
    assignmentCreated: false,

    /**
     * @property {boolean} Determine if editing or creating a new assignment
     */
    isEditMode: false,

    /**
     * @property {boolean} Determine if copying an assignment
     */
    isCopyMode: false,

    /**
        Show all classes in Assignment.
    **/
    classesInAssignment: "",

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

    classesAndDates: Ember.A(),

    /**
     *
     * @property {Class[]} My active classes for the current product
     */
    myClasses: Ember.computed('class.product.id', function(){
        var clazz = this.get('class');
        var productId = clazz.get('product').get("id");
        var instructorController = this.get("instructorController");
        return instructorController.getActiveClassesByProduct(productId);
    }),

    /**
     * @property {Assignment} Indicates if the
     *  at least one student has started the assignment
     */
   selectedClass: Ember.computed('assignment.isStarted', function(){
        var assignment = this.get('assignment');
        return (assignment.get('isStarted')) ? 'disabled' : false;
   }),

    isAssignmentHideThresholdOn: Ember.computed('assignment.hideThresholdLabels', function(){
        var assignment = this.get('assignment');
        if (assignment.get('hideThresholdLabels')) {
            return true;
        }
        return false;
    }),

    /**
     * Allow auto shutoff Product Settings
     */
    allowAutoShutoff: Ember.computed(function(){
        return this.get("product.isExamAutoShutoffAllowed");
    }),

    /**
     * Allow threshold control Product Settings
     */
    allowThresholdControl: Ember.computed(function(){
        return this.get("product.isExamThresholdControlAllowed");
    }),

    showStaggeredOptions: Ember.computed(function(){
        return this.showModuleByToggle("staggeredAssignment");
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
     * Initializes an empty assignment
     */
    initAssignment: function(){
        var controller = this;
        var assignment = controller.store.createRecord("assignment");
        assignment.set('type', "exam");
        assignment.set('points', 100);
        assignment.set('numberQuestion', this.get("numQuestions")[0]);
        assignment.set('timeLimit', this.get("minutesLimit")[0]);
        assignment.set('autoShutoff', false);

        //Do not initialize 'hideThresholdLabels': PBI 9611
        assignment.set('targetMasteryLevel', controller.get("minimumThreshold"));
        controller.set("assignmentCustomThreshold", controller.get("minimumThreshold"));

        //init timezone
        var timeZone = DateUtil.getLocalTimeZone();
        assignment.set('timeZone', timeZone);

        //init dates
        var dateUtil = DateUtil.create({});
        var availableDate = new Date();
        var dueDate = new Date();
        dueDate.setDate(availableDate.getDate()+7);

        controller.set("startDate", dateUtil.format(availableDate, dateUtil.slashedShortDateFormat, timeZone));
        controller.set("dueDate", dateUtil.format(dueDate, dateUtil.slashedShortDateFormat, timeZone));
        controller.set('startHour', "08,00");
        controller.set('dueHour', "08,00");

        $("#startHour").val(controller.get("startHour")).trigger("change");
        $("#dueHour").val(controller.get("dueHour")).trigger("change");

        controller.set("assignment", assignment);
    },

    initCopyAssignment: function(assignment) {
        var controller = this;
        assignment.get("classes").clear();
        var newAssignment = assignment.toJSON();
        delete newAssignment.classes;
        delete newAssignment.studentResults;
        for (var key in newAssignment) {
            if(key !== 'classes') {
                if (newAssignment[key] !== assignment.get(key)) {
                    newAssignment[key] = assignment.get(key);
                }
            }

        }

        if(assignment.get("targetMasteryLevel")) {
            newAssignment.hideThresholdLabels = 0;
        }

        //newAssignment = Assignment.copyAssignmentRecord(this.store, assignment);
        newAssignment = this.store.createRecord("assignment", newAssignment);

        //init timezone
        var timeZone = DateUtil.getLocalTimeZone();
        newAssignment.set("timeZone", timeZone);

        //init dates
        var dateUtil = DateUtil.create({});
        var availableDate = new Date();
        var dueDate = new Date();
        dueDate.setDate(availableDate.getDate()+7);

        controller.set("startDate", dateUtil.format(availableDate, dateUtil.slashedShortDateFormat, timeZone));
        controller.set("dueDate", dateUtil.format(dueDate, dateUtil.slashedShortDateFormat, timeZone));
        controller.set('startHour', "08,00");
        controller.set('dueHour', "08,00");

        $("#startHour").val(controller.get("startHour")).trigger("change");
        $("#dueHour").val(controller.get("startHour")).trigger("change");

                this.setAssignment(newAssignment);

    },

    /*
        Set assignment if is Edit Mode
     */
    setAssignment: function(assignment) {
        var controller = this;
        controller.set("assignment", assignment);
        controller.set("isEditMode", true);

        if(assignment.get("targetMasteryLevel")){
            controller.set("assignmentCustomThreshold", assignment.get("targetMasteryLevel"));
        }
        else{
            controller.set("assignmentCustomThreshold", controller.get("minimumThreshold"));
        }


        if(!controller.get("isCopyMode")) {
            var dateUtil = new DateUtil(),
            availableDate = assignment.get("availableDate"),
            dueDate = assignment.get("dueDate"),
            availableHourStr,
            dueHourStr;

            var timeZone = assignment.get("timeZone");

            // Extract hour values and change them to format expected by select field i.e. "hh,mm"
            availableHourStr = dateUtil.format(assignment.get("availableDateRound"), "HH,mm", timeZone);
            dueHourStr = dateUtil.format(assignment.get("dueDateRound"), "HH,mm", timeZone);

            //converting to assignment timezone
            controller.set("startDate", dateUtil.format(availableDate, dateUtil.slashedShortDateFormat, timeZone));
            controller.set("dueDate", dateUtil.format(dueDate, dateUtil.slashedShortDateFormat, timeZone));

            controller.set('startHour', availableHourStr);
            controller.set('dueHour', dueHourStr);
            Ember.run.later((function () {
                $("#startHour").val(availableHourStr).trigger("change");
                $("#dueHour").val(dueHourStr).trigger("change");
            }), 400);

        }

        if (!assignment.get("hasTimeLimit")){
             $('.assign-exam-form #noTimeLimitRadio').prop('checked', true);
        }
        else{
             $('.assign-exam-form #noTimeLimitRadio').prop('checked', false);
        }

        //Set Classes Selected
        assignment.get("classes").then(function(classes){
            classes.map(function(clazz){
                clazz.get('product'); //load products from sideload
            });
            controller.set("classesInAssignment", classes.mapBy("id").join("-"));
        });

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

    hasTimeLimit: function(){
        var selectedTimeLimit = $('.assign-exam-form input[name=timeLimit]:checked').val();
        return (selectedTimeLimit === '1');
    },

    /**
     * Check the radio Buttons for Custom Dates
     */
    listenDateRadio: Ember.observer('changeDatesRadio', function(){
        var controller = this;
        if (controller.get("changeDatesRadio") === "changeDates") {
            controller.set("changeDatesEnable", true);
        } else {
            controller.set("changeDatesEnable", false);
            Ember.run.later((function () {
                controller.initDataPicker();
            }), 100);
        }
    }),

    /**
     * Reset to default values
     */
    resetValues:function(){
        var controller = this;
        var assignment = controller.get("assignment");
        if (assignment.get("hasDirtyAttributes") && !assignment.get("isNew") && !assignment.get("isSaving")) {
            assignment.rollback();
        }
        controller.set("assignment", Ember.Object.create({}));
        controller.set("selectClassMessage", false);
        controller.set("dueDateBeforeMessage", false);
        controller.set("assignmentCreated", false);
        controller.set("assignmentId", null);
        controller.set("isEditMode", false);
        controller.set("isCopyMode", false);
        controller.set("classesInAssignment", "");
        controller.get("customClasses").clear();
        controller.set("changeDatesRadio", "keepDates");
        controller.set("changeDatesEnable", false);
        controller.set("assignmentCustomThreshold", null);
    },

    initDataPicker: function() {
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
            if (ev.date !== null && (ev.date.valueOf() < checkin.getDate().valueOf())) {
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

            if (ev.date !== null && (ev.date.valueOf() > checkout.getDate().valueOf())) {
                var newDate = new Date(ev.date);
                newDate.setDate(newDate.getDate() + 1);
                checkout.setDate(newDate);
            }
            checkin.hide();
            checkout.show();
            $(this).validate();
        }).data('datepicker');
    },

    getDatesInfo: function(){
        var self = this;
        var myAssignment = self.get("assignment"),
            datesOk = true,
            customDataByClass = [];

        self.get("customClasses").forEach(function (clazz) {
            var dateUtil = DateUtil.create({}),
                timeZone = $('#datesClass'+clazz.id +' #secondTimeZone'+clazz.id).data("timezone"),
                startDate = $('#datesClass'+clazz.id+' .startDate').val(),
                dueDate = $('#datesClass'+clazz.id+' .dueDate').val(),
                startHour = $('#datesClass'+clazz.id+' .startHour').val(),
                dueHour = $('#datesClass'+clazz.id+' .endHour').val();

            var date = startDate + " " + startHour;
            //dates are handle in local time, they are converted to UTC before sending the request
            startDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

            date = dueDate + " " + dueHour;
            //dates are handle in local time, they are converted to UTC before sending the request
            dueDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

            datesOk = moment(startDate).isBefore(moment(dueDate));

            var obj = {
                "idClass" : clazz.get("id"),
                "availableDate"  : startDate,
                "dueDate" : dueDate,
                "timeZone" : timeZone
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
        var self = this;
        var myAssignment = self.get("assignment"),
            datesOk = true,
            customDataByClass = [],
            dateUtil = DateUtil.create({}),
            timeZone = myAssignment.get("timeZone");

        var date = startDate + " " + startHour;
        //dates are handle in local time, they are converted to UTC before sending the request
        startDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

        date = dueDate + " " + dueHour;
        //dates are handle in local time, they are converted to UTC before sending the request
        dueDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

        datesOk = moment(startDate).isBefore(moment(dueDate));

        self.get("customClasses").forEach(function (clazz) {
            var obj = {
                "idClass" : clazz.get("id"),
                "availableDate"  : startDate,
                "dueDate" : dueDate,
                "timeZone" : timeZone
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
        }
        return datesOk;
    },

    /**
     * @method create a list with info to show the last confirmation Page
     */
    setClassesAndDates: function(){
        var self = this;
        var assignment = self.get("assignment");
        var store = this.store;
        self.get("classesAndDates").clear();
        JSON.parse(assignment.get("customDataByClass")).forEach(function (dateByClass) {
            store.find("class", dateByClass.idClass).then(function(clazz){
                var obj = {
                    "idClass" : clazz.get("id"),
                    "name": clazz.get("name"),
                    "term": clazz.get("term"),
                    "isUnknownTerm": clazz.get("isUnknownTerm"),
                    "availableDate"  : new Date(dateByClass.availableDate),
                    "dueDate" : new Date(dateByClass.dueDate),
                    "timeZone" : dateByClass.timeZone
                };
                self.get("classesAndDates").pushObject(obj);
            });
        });
    },

    actions:{
        /**
         * Sets the timezone from the select element
         * @param timezone
         */
        setTimeZone: function(timezone){
            this.get("assignment").set("timeZone", timezone);
        },

        assignExam : function(data){
            var controller = this;
            var assignment = controller.get("assignment");
            var selectedClasses = controller.getSelectedClasses();
            //validate classes
            var hasClasses = true,
                isStaggered = (controller.get("changeDatesEnable") || assignment.get("staggered") === true);

            if(controller.get("isEditMode") && isStaggered && !controller.get("isCopyMode")){
                hasClasses = (assignment.get("classes").get("length") > 0);
            }else{
                hasClasses = (selectedClasses.get("length") > 0);
            }
            controller.set("selectClassMessage", !hasClasses);

            var validationOk = $("#assign-an-exam").valid() && hasClasses;
            if (validationOk) {
                var datesOk = true;
                if (controller.get("changeDatesEnable")) {
                    controller.getDatesInfo();
                    assignment.set("staggered", true);
                } else {
                    if((!controller.get('isEditMode') && controller.get("showStaggeredOptions")) || controller.get("isCopyMode")) {
                        datesOk = controller.setCustomDatesInfo(
                                    controller.get("startDate"),
                                    controller.get("startHour"),
                                    controller.get("dueDate"),
                                    controller.get("dueHour")
                                  );
                    } else {
                        datesOk = assignment.setDates(
                            controller.get("startDate"),
                            controller.get("startHour"),
                            controller.get("dueDate"),
                            controller.get("dueHour")
                        );
                    }
                    assignment.set("staggered", controller.get("showStaggeredOptions"));
                    controller.set("dueDateBeforeMessage", !datesOk);
                }

                if (datesOk) {
                    //Add classes
                    Ember.RSVP.hash({
                        classes: assignment.get("classes")
                    }).then(function(hash){
                        if(!isStaggered || (isStaggered && (!controller.get("isEditMode") || controller.get("isCopyMode")))) {
                            var classes = hash.classes;
                            classes.clear();
                            classes.pushObjects(selectedClasses);
                        }

                        //clears time limit when necessary
                        if (!controller.hasTimeLimit()) {
                            assignment.set("timeLimit", 0);
                        }

                        // When thresholdLabels were not selected the target mastery level should be null
                        if (assignment.get("hideThresholdLabels") === undefined || assignment.get("hideThresholdLabels")) {
                            assignment.set("targetMasteryLevel", null);
                        } else if(!assignment.get("hideThresholdLabels")) {
                            assignment.set("targetMasteryLevel", controller.get("assignmentCustomThreshold"));
                        }

                        assignment.save().then(function() {
                            controller.trigger('asyncButton.restore', data.component);
                            if (controller.get("isEditMode") && !controller.get("isCopyMode")) {
                                controller.transitionToRoute("/instructor/examSummary/" + controller.get("class").get("id"));
                            } else {
                                if (assignment.get("staggered")) {//create a list with classes and Dates
                                    controller.setClassesAndDates();
                                }
                                controller.set("assignmentCreated", true);
                            }
                        });
                    });
                } else {
                    controller.trigger('asyncButton.restore', data.component);
                }
            }
            else{
                controller.trigger('asyncButton.restore', data.component);
            }
        },

        goBack: function(productId, classId){
            var controller = this;
            //Rollbacks changes for the original assignment
            controller.get("assignment").rollback();
            controller.get("customClasses").clear();
            controller.transitionToRoute("/instructor/assignments/" + productId + "/" + classId);
        },

        changeOverallSettings: function(classId) {
            var controller = this;
            controller.transitionToRoute("/instructor/overallExamSettings/" + classId);
        },

        selectClass: function(clazz){
            // var ids = $(".activeClasses input:checked").map(function () {
            //     return $(this).val();
            // });
            // var instructorController = controller.get("instructorController");
            var controller = this;
            if ($("#check"+clazz.get("id")).prop("checked")){ //Add to the list of classes
                controller.get("customClasses").pushObject(clazz);
            }
            else{
                var indexClass = controller.get("customClasses").indexOf(clazz);
                if (indexClass > -1) {
                    controller.get("customClasses").removeAt(indexClass, 1);
                }
            }
        }

    }
});
