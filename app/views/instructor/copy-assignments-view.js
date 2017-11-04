SakuraiWebapp.InstructorCopyAssignmentsView = Ember.View.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructorComplete',

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions: function () {
        this.activeHeaderMenu("menu-copyAssignments");

        this.fixMainMenu();
        this.setupValidator();
        this.setupDatePicker();
        this.setupDateHours();
    },

    /**
     * Setups the date hours
     */
    setupDateHours: function(){
        $(".custom-select").select2();
    },

    /**
     * Setups the date pickers
     */
    setupDatePicker: function(){
        /*****************************************
         *  Initialize Date picker and validation
         *******************************************/
        var controller = this.get('controller');
        var nowTemp = new Date();
        var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
        controller.get("copyAssignments").forEach(function(copyAssignment, index){
            var checkout = $('#datesAssignment'+ copyAssignment.get("parentAssignment").get("id") +' .dueDate').datepicker({
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

            var checkin = $('#datesAssignment'+ copyAssignment.get("parentAssignment").get("id") +' .startDate').datepicker({
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
        });

        //Set dates
        $('.startDate').datepicker('setDate', controller.get("defaultStartDate"));
        $('.dueDate').datepicker('setDate', controller.get("defaultDueDate"));

        //Set hours
        $('.startHour').val(controller.get("defaultStartHour")).trigger("change");
        $('.endHour').val(controller.get("defaultDueHour")).trigger("change");
    },

    /**
     * Setups the form validator
     */
    setupValidator: function(){
        // validate form
        //adds regex method to validator
        $.validator.addMethod(
            "regex",
            function(value, element, regexp) {
                var re = new RegExp(regexp);
                return re.test(value);
            },
            "No message"
        );

        $("#copy-assignments").validate({
            ignore: 'input[type=hidden]',
            onsubmit: false,
            onkeyup: function(element) { $(element).valid(); }
        });
        var controller = this.get('controller');
        controller.get("copyAssignments").forEach(function(copyAssignment, index){
            $("#copy-assignments .assignment-name input[name=" + copyAssignment.get("parentAssignment").get("id") + "]").rules("add", {
                required: true,
                maxlength: 50,
                messages: {
                  required: I18n.t('copyAssignments.assignmentNameErrors.required'),
                  maxlength: I18n.t('copyAssignments.assignmentNameErrors.max')
                }
            });
        });
    }
});
