SakuraiWebapp.InstructorAssignExamView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forInstructorComplete',
    _controller: null,

    didReceiveAttrs : function(){
        this._controller = this.get('controller');
    },

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions : function() {
        this.setupDatePicker();
        this.setupDateHours();
        this.disableEnterKey();
        if (this._controller.isEditMode) {
            if (this._controller.assignment.get("timeLimit"))
                $('#timeLimitRadio').click();
            else
                this._controller.assignment.set('timeLimit', this._controller.get("minutesLimit")[0]);
        }

        this.activeHeaderMenu("menu-assignExam");
        this.fixMainMenu();
        this.setupTimeLimitInteraction(this._controller);
        this.setupValidator();
    },

    /**
     * Disables the form enter key
     */
    disableEnterKey : function(){
        $('#assign-an-exam').on("keyup keypress", function(e) {
            var code = e.keyCode || e.which;
            if (code  == 13) {
                e.preventDefault();
                return false;
            }
        });
    },

    setupTimeLimitInteraction: function(controller){
        //Init Time Limit
        $( ".assign-exam-form .assign-time-limit" ).on( "click", "#noTimeLimitRadio", function() {
            $("#time-limit-text").addClass('disabled');
            $("#minutes_limit").addClass('disabled');
        });

        $( ".assign-exam-form .assign-time-limit" ).on( "click", "#timeLimitRadio", function() {
            if (controller.get("assignment") && !controller.get("assignment.autoShutoff")) {
                $("#time-limit-text").removeClass('disabled');
                $("#minutes_limit").removeClass('disabled');
            }
        });
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

        var validator = $("#assign-an-exam").validate({
            ignore: 'input[type=hidden]',
            onsubmit: false,
            onkeyup: function(element) { $(element).valid(); },
            rules: {
                assignmentName: {
                    required: true,
                    maxlength: 50
                },
                points: {
                    required: true,
                    regex: /^\d{1,3}(\.\d{1,2})?$/
                }
            },
            messages: {
                assignmentName: {
                    required: I18n.t('assignExam.assignmentNameErrors.required'),
                    maxlength: I18n.t('assignExam.assignmentNameErrors.max')
                },
                points: {
                    required: I18n.t('assignExam.pointValueError.required'),
                    regex: I18n.t('assignExam.pointValueError.regex')
                }
            }
        });
    },

    /**
     * Setups the date hours
     */
    setupDateHours: function(){
        var controller = this._controller;
        $(".custom-select").select2();
        // Select2 is not reading the value of the select elements.
        // Set the value directly in Select2 (there must a better way to do this)
        $("#startHour").val(controller.startHour).trigger("change");
        $("#dueHour").val(controller.dueHour).trigger("change");
    },

    /**
     * Setups the date pickers
     */
    setupDatePicker: function(){
        /*****************************************
         *  Initialize Date picker and validation
         *******************************************/
        var controller = this._controller;
        var nowTemp = new Date();
        var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

        var checkout = $('#dueDate').datepicker({
            onRender: function(date) {
                return date.valueOf() <= checkin.getDate().valueOf() ? 'disabled' : '';
            }
        }).on('changeDate', function(ev) {
                if(!controller.assignment.get("hasBeenCompletedAtLeastOnce")){
                    if (ev.date != null && (ev.date.valueOf() < checkin.getDate().valueOf())) {
                        var newDate = new Date(ev.date);
                        newDate.setDate(newDate.getDate() - 1);
                        checkin.setDate(newDate);
                        checkin.show();
                    }
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
    }

});
