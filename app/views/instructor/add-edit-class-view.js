import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forInstructor',
    _controller: null,

    didReceiveAttrs : function(){
        this._controller = this.get('controller');
    },

    hideCalendars: function() {
        $('#dpd1').datepicker('hide');
        $('#dpd2').datepicker('hide');
    },

    didInsertElement: function() {
        // this._controller = this.get('controller');
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions: function () {
        var controller = this._controller,
            self = this,
            formContainer = $("#add-edit-class");

        this.fixMainMenu();

        /*****************************************
		*  Initialize select2 plugin for schools
		*  and products
        *******************************************/
        $("#select-product").select2().on('select2-open', function() {
            self.hideCalendars();
        });

        var $select = $("#select_school");
            $.fn.select2.amd.require([
              'select2/data/array',
              'select2/utils'
            ], function (ArrayData, Utils) {
                function CustomData ($element, options) {
                    CustomData.__super__.constructor.call(this, $element, options);
                }

                Utils.Extend(CustomData, ArrayData);

                CustomData.prototype.query = function (params, callback) {
                    if (params.term && params.term.trim().length > 2)
                    {
                        var promise = controller.searchSchools(params.term);
                        promise.then(function (schools) {
                            controller.set("schools", schools);
                            var data = { results : []};
                            $.each(schools.toArray(), function(i, school){
                                data.results.push({ id: school.get("id"), text: school.get("name")});
                            });
                            callback(data);
                        });
                    }
                };

                $select.select2({
                    minimumInputLength: 3,
                    dataAdapter: CustomData
                });
            });

        $select.on("change", function () { $('#select_school-error').empty(); });

        $select.on("select2:open", function () { self.hideCalendars(); });

        /*****************************************
		*  Set validation to Form and messages
        *******************************************/
        $.validator.addMethod(
	        "regex",
	        function(value, element, regexp) {
	            var re = new RegExp(regexp);
	            return this.optional(element) || re.test(value);
	        },
        	I18n.t('classes.errorSpecialCharacter')
		);
        // validate form
        formContainer.validate({
            ignore: 'input[type=hidden]',
            onsubmit: false,
            rules: {
                className: {
					required: true,
					maxlength: 50,
					regex: "^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$"
				},
				term: {
					required: true,
					maxlength: 50,
					regex: "^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$"
				},
				select_school:{
					required: true
				}
            },
            messages: {
                className: {
                    required: I18n.t('classes.errorClassNameRequired'),
                    maxlength: I18n.t('classes.errorMaxLegth')
                },
                term: {
                    required: I18n.t('classes.errorTermRequired'),
                    maxlength: I18n.t('classes.errorMaxLegth')
                },
                select_school: {
                    required: I18n.t('classes.errorSchoolRequired')
                }
            }
        });

        formContainer.bind("keypress", function(e) {
          var KEYCODE = ( document.all ? window.event.keyCode : e.which) ;
          if (KEYCODE === 13) {
            e.preventDefault();
            e.stopPropagation();
          }
        });

        /*****************************************
		*  Initialize Date picker and validation
        *******************************************/
		var nowTemp = new Date();
		var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

		var checkout = $('#dpd2').datepicker({
			format: 'mm/dd/yyyy',
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
		}).data('datepicker');

		var checkin = $('#dpd1').datepicker({
			format: 'mm/dd/yyyy',
			pickTime: true,
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
		}).data('datepicker');

    },

    willDestroyElement: function() {
        var startDateInput = $('#dpd1'),
            endDateInput = $('#dpd2');

        $('#select-product').select2();
        $('#select_school').select2();

        //removing event handlers
        startDateInput.off();
        endDateInput.off();

        // Hide any datepickers, in case they're open
        startDateInput.datepicker('hide');
        endDateInput.datepicker('hide');

        // Remove references to the datepickers
        startDateInput.data('datepicker', null);
        endDateInput.data('datepicker', null);

        // Destroy the datepickers
        startDateInput.datepicker('destroy');
        endDateInput.datepicker('destroy');

        $("#add-edit-class").data('validator', null);
    }

});
