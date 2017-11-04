/**
 * Component to manage the date for each assignment class
 *
 * @extends Ember.Component
 *
 * @param customClasses {ARRAY} List of selected clases
 */

SakuraiWebapp.ManageDateClassesComponent = Ember.Component.extend({

	/**
	* List of classes selected
	**/
	customClass: null,

	/**
	* List of timezones avalable
	**/
	timezones: null,

    /**
    * @property {String} Default Time Zone Value
    **/
    defaultTimeZone: null,

    /**
    * @property {Boolean} Is Question Collestion
    **/
    isQC: null,

    /**
    * @property {date} Default Start Date
    **/
    defaultStartDate: null,

    /**
    * @property {date} Default Due Date
    **/
    defaultDueDate: null,

    /**
    * @property {string} Default Start Hour
    **/
    defaultStartHour: null,

    /**
    * @property {string} Default Due Date
    **/
    defaultDueHour: null,

    /**
    * Available list of hours
    **/
    timeList: Ember.computed(function(){
        return SakuraiWebapp.Assignment.availableHoursList()
    }),


    didInsertElement: function(){
        this._super();
        this._controller = this.get('controller');
    },

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
    },

    afterRenderEvent : function() {
        this.initDatepicker(this.get('customClass.id'));
    },

    initDatepicker: function(classId){
        /*****************************************
        *  Initialize Date picker and validation
        *******************************************/
        var component = this;
        var nowTemp = new Date();
        var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
        var checkout = $('#datesClass'+ classId +' .dueDate').datepicker({
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

        var checkin = $('#datesClass'+ classId +' .startDate').datepicker({
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

        $('#datesClass'+ classId +' .startDate').datepicker('setDate', component.get("defaultStartDate"));
        $('#datesClass'+ classId +' .dueDate').datepicker('setDate', component.get("defaultDueDate"));

        //Set Timezones
        $('#datesClass'+ classId +' .tZLabel').text(SakuraiWebapp.DateUtil.create({}).zoneAbbr(component.get("defaultTimeZone")));
        $('#datesClass'+ classId +' .tZLabel').data("timezone", component.get("defaultTimeZone"));

        //Set hours
        $('#datesClass'+ classId +' .startHour').val(component.get("defaultStartHour")).trigger("change");
        $('#datesClass'+ classId +' .endHour').val(component.get("defaultDueHour")).trigger("change");
        $('#datesClass'+classId).data("init", true);
    },

    actions:{
        setTimeZone: function(timeZone, classId){
            $("#firstTimeZone"+classId).text(SakuraiWebapp.DateUtil.create({}).zoneAbbr(timeZone));
            $("#secondTimeZone"+classId).text(SakuraiWebapp.DateUtil.create({}).zoneAbbr(timeZone));
            $("#secondTimeZone"+classId).data( "timezone", timeZone);
        }
    }
});
