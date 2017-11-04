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
    queryParams: ['assignmentIds'],
    headerClasses: Ember.inject.controller(),
    instructor: Ember.inject.controller(),
    instructorController: Ember.computed.alias("instructor"),

    /**
     * @property indicates if need edit an assignment
     */
    assignmentIds: null,

    /**
     * @property {Class} the class
     */
    class: null,

    /**
     * @property {Product} the product
     */
    product: null,
    
    /**
     * List of selected assginments to copy
     * @property {Ember} array
     */
    copyAssignments: Ember.A(),

    /**
     * Indicate it is copying
     * @property boolean
     */
    isCopy: true,
    
    /**
     * @property [] timezones
     */
    timezones: Ember.A(),

    /**
     * @property {date} defaultStartDate
     */
    defaultStartDate: null,

    /**
     * @property {date} defaultDueDate
     */
    defaultDueDate: null,

    /**
     * @property {string} default start hour
     */
    defaultStartHour: "8,0",

    /**
     * @property {string} default due hour
     */
    defaultDueHour: "8,0",

    /**
     * Indicates when to show the please select a class message
     */
    selectClassMessage: false,

    /**
     * Indicates which class to copy assignments to
     */
    copyClassId: null,

    /**
     * @property {bool} indicates when the assignment was created
     */
    assignmentCreated: false,

    classExamOverallSettings :null,

    copyToClass: Ember.observer('copyClassId', function(){
        var instructorController = this.get("instructorController");
        var copyAssignments = this.get("copyAssignments");
        var selectClass = instructorController.getClassesByIds([this.get("copyClassId")]);
        copyAssignments.forEach(function(record){
            var promise = record.get('classes');
            promise.then(function(classes){
                classes.clear();
                selectClass.forEach(function (clazz) {
                    classes.pushObject(clazz);
                });
            });
        });
    }),

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
     * Allow threshold control Product Settings
     */
    allowThresholdControl: Ember.computed(function(){
        return this.get("product.isExamThresholdControlAllowed");
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

    /**
    * Available list of hours
    **/
    timeList: Ember.computed(function(){
        return Assignment.availableHoursList();
    }),

    /**
     * Reset to default values
     */
    resetValues:function(){
        var controller = this;
        controller.set("assignmentIds", null);
        controller.set("selectClassMessage", false);
        controller.get("copyAssignments").clear();
        controller.set("assignmentCreated", false);
        controller.set("copyClassId", null);
    },

    loadAssignments: function(assignments){
        var copyAssignments = [];
        var controller = this,
            store = controller.store;
        controller.set('timezones', DateUtil.getTimeZones());
        //init dates
        var dateUtil = DateUtil.create({});
        var timeZone = DateUtil.getLocalTimeZone();
        var availableDate = new Date();
        var dueDate = new Date();
        dueDate.setDate(availableDate.getDate()+7);

        controller.set("defaultStartDate", dateUtil.format(availableDate, dateUtil.slashedShortDateFormat, timeZone));
        controller.set("defaultDueDate", dateUtil.format(dueDate, dateUtil.slashedShortDateFormat, timeZone));
        controller.set("defaultStartHour", "08,00");
        controller.set("defaultDueHour", "08,00");

        var assignmentIds = controller.get("assignmentIds").split(",").filter(function(elem, index, self) {
                                return index === self.indexOf(elem);
                            });
        assignmentIds.forEach(function(assignmentId){
            var assignment = assignments.findBy("id", assignmentId);
            var copyAssignment = Assignment.copyAssignmentRecord(store, assignment);
            copyAssignment.set("timeZone", timeZone);
            copyAssignments.pushObject(copyAssignment);
        });
        controller.set('copyAssignments', copyAssignments);
    },

    saveAssignments: function() {
        var controller = this;
        var copyAssignments = controller.get('copyAssignments');
        return new Ember.RSVP.Promise( function(resolve, reject) {
            var promises = [];
            copyAssignments.forEach(function(record) {
                Ember.Logger.debug(controller.toString() + ': copying record with id: ', record.get("parentAssignment").get("id"));
                promises.push(record.save());
            });

            Ember.RSVP.all(promises).then( function() {
                Ember.Logger.debug(controller.toString() + ': all records were successfully copied');
                // Make sure all async side-effects are run before resolving the promise
                Ember.run(null, resolve);
            }, function() {
                var error = new Ember.Error('Unable to copy all records');
                // Make sure all async side-effects are run before rejecting the promise
                Ember.run(null, reject, error);
            });
        });
    },

    actions:{
        /**
         * Sets the timezone from the select element
         * @param timezone
         */
        setTimeZone: function(assignment, timezone){
            assignment.set("timeZone", timezone);
        },

        copyAssignments: function(data) {
            var controller = this;
            var copyAssignments = controller.get("copyAssignments");
            var copyClassId = controller.get('copyClassId');
            controller.set("selectClassMessage", !!copyClassId ? false : true);

            var validationOk = $("#copy-assignments").valid() && !!copyClassId;
            if (validationOk) {
                var datesOk = false;
                copyAssignments.forEach(function(assignment){
                    var customDataByClass = [],
                        dateUtil = DateUtil.create({}),
                        timeZone = assignment.get("timeZone"),
                        startDate = $('#datesAssignment'+assignment.get("parentAssignment").get("id")+' .startDate').val(),
                        dueDate = $('#datesAssignment'+assignment.get("parentAssignment").get("id")+' .dueDate').val(),
                        startHour = $('#datesAssignment'+assignment.get("parentAssignment").get("id")+' .startHour').val(),
                        dueHour = $('#datesAssignment'+assignment.get("parentAssignment").get("id")+' .endHour').val();

                    var date = startDate + " " + startHour;
                    //dates are handle in local time, they are converted to UTC before sending the request
                    startDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

                    date = dueDate + " " + dueHour;
                    //dates are handle in local time, they are converted to UTC before sending the request
                    dueDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

                    datesOk = moment(startDate).isBefore(moment(dueDate));

                    var obj = {
                        "idClass" : copyClassId,
                        "availableDate"  : startDate,
                        "dueDate" : dueDate,
                        "timeZone" : timeZone,
                        "autoSubmit": assignment.get("autoSubmit")
                    };

                    if (datesOk){
                        customDataByClass.push(obj);
                        assignment.set("customDataByClass", JSON.stringify(customDataByClass));
                        assignment.set("staggered", true);
                    }
                    else{
                        $("#error-dates-"+assignment.get("parentAssignment").get("id")).removeClass("hide");
                        controller.trigger('asyncButton.restore', data.component);
                        return false;
                    }
                });
                if(datesOk) {
                    controller.saveAssignments().then(function(){
                        controller.trigger('asyncButton.restore', data.component);
                        controller.set("assignmentCreated", true);
                    });
                }
            } else {
                controller.trigger('asyncButton.restore', data.component);
            }
        },

        goBack: function(productId, classId){
            var controller = this;
            controller.get("copyAssignments").clear();
            controller.transitionToRoute("/instructor/assignments/" + productId + "/" + classId);
        }
    }
});
