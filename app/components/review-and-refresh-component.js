SakuraiWebapp.ReviewAndRefreshComponent = Ember.Component.extend({
    /**
     * @property {class} Current Class
     */
    _class: null,
    /**
     * @property {product} Current Product
     */
    _product: null,
    /**
     * @property {Ember.DS.Store}
     */
    'data-store': null,
    /**
     * @property {array} List of available mastery levels
     */
    mlList: [5, 6, 7, 8],
    /**
     * @property {Date} Manage Start Date Field
     */
    startDateRR: null,
    /**
     * @property {bool} Manage Start Hour
     */
    startHourRR: null,
    /**
     * @property {bool} Control if settings are active
     */
    activeSettings: false,
    /**
     * @Property {reviewRefreshClassSetting} Current info of model reviewRefreshClassSetting
     **/
    reviewRefreshClassSettings: null,
    /**
     * Manage radio of settings
     **/
    settings_radio: "",
    /**
     * Manage radio of Review and Refresh options
     **/
    options_radio: "change_settings",

    /**
     * Manage radio of settings
     **/
    isloading: true,

    "data-change-settings": "onChangeSettings",

    /**
     * Mastery level default for that product
     **/
    defaultML: Ember.computed(function(){
        return this.get("_product.reviewAndRefreshML");
    }),

    /**
     * Check if the radio is Default to active and inactive some options
     **/
    isDefaultSettings: Ember.computed('settings_radio', function(){
        return (this.get("settings_radio") == "default")
    }),

    /**
     * Show if is active R&R for that class
     **/
    isON: Ember.computed('reviewRefreshClassSettings.active', function(){
        var reviewRefreshClassSettings = this.get("reviewRefreshClassSettings");
        return (reviewRefreshClassSettings && reviewRefreshClassSettings.get("active"));
    }),

    /**
     *
     **/
    available: Ember.computed("reviewRefreshClassSettings.availableDate", "reviewRefreshClassSettings.timeZone", function(){
        var component = this,
                reviewRefreshClassSettings = component.get("reviewRefreshClassSettings"),
                available = true;

        if ((reviewRefreshClassSettings.get("availableDate")) && (reviewRefreshClassSettings.get("timeZone"))) {
            var availableDate = reviewRefreshClassSettings.get("availableDate");
            var now = new Date();
            if (availableDate.valueOf() > now.valueOf()) {
                available = false;
            }
        }

        return available;
    }),

    /**
     * Active Review and Refresh options
     **/
    activeRROptions: Ember.computed("activeAbout", "activeSettings", function(){
        return (!this.get("activeAbout") && (this.get("activeSettings")))
    }),

    /**
    * Available list of hours
    **/
    timeList: Ember.computed(function(){
        return SakuraiWebapp.Assignment.availableHoursList();
    }),

    /*
     * === Observers ===
     */
    aboutVisibility: Ember.observer('activeAbout', function () {
        this.sendAction('data-change-settings', this.get('activeAbout'));
        if (this.get('activeAbout')) {
            $("html, body").animate({scrollTop: 0}, "slow");
        }
    }),

    settingsVisibility: Ember.observer('activeSettings', function () {
        this.sendAction('data-change-settings', this.get('activeSettings'));
        if (this.get('activeSettings')) {
            this.initDatePicker();
            $("html, body").animate({scrollTop: 0}, "slow");
            this.initSettings();
        }
    }),

    /**
     * List of Timezones
     **/
    timezones: Ember.computed(function(){
        return SakuraiWebapp.DateUtil.getTimeZones();
    }),

    didInsertElement: function() {
        this._super();
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
    },

    afterRenderEvent: function () {
        //Get Review and  Refresh for epecific class
        var store = this.get("data-store"),
                component = this;
        component.set("activeSettings", false);
        component.set("activeAbout", false);
        store.query("reviewRefreshClassSetting", {classId: component.get("_class.id")}).then(function (result) {
            if (result.get("length") == 1) {
                component.set("reviewRefreshClassSettings", result.objectAt(0));
            }
            component.set("isloading", false);
        });
    },

    initDatePicker: function () {
        var date = new Date();
        date.setDate(date.getDate() - 1);

        var checkin = $('#startDateRR').datepicker({
            startDate: date
        }).on('changeDate', function (ev) {
            checkin.hide();
        }).data('datepicker');
    },

    resetDateHour: function () {
        var component = this,
                dateUtil = new SakuraiWebapp.DateUtil(),
                timeZone = SakuraiWebapp.DateUtil.getLocalTimeZone();
        reviewRefreshClassSettings = component.get("reviewRefreshClassSettings")

        component.set("startDateRR", dateUtil.format(new Date(), dateUtil.slashedShortDateFormat, timeZone));
        component.set("startHourRR", "08,00");
        $("#startHourRR").val(component.get("startHourRR")).trigger("change");
        $('#startDateRR').datepicker('update', new Date());
        reviewRefreshClassSettings.set('timeZone', timeZone);
    },

    initSettings: function () {
        var component = this,
                reviewRefreshClassSettings = component.get("reviewRefreshClassSettings"),
                dateUtil = new SakuraiWebapp.DateUtil(),
                store = this.get("data-store");

        if (reviewRefreshClassSettings) { //if the review and Refresh setting exist set information
            // If the Available Date is empty
            if (!reviewRefreshClassSettings.get("active")) { //Is Inactive
                component.resetDateHour();
                component.set("settings_radio", "activeInactive");
                $('.settings-section input[type=radio]:eq(2)').prop("checked", true);
            } else {
                if ((!reviewRefreshClassSettings.get("availableDate")) || (!reviewRefreshClassSettings.get("timeZone"))) { //Is active and has ML
                    component.resetDateHour();
                    component.set("settings_radio", "default");
                    $('.settings-section input[type=radio]:eq(0)').prop("checked", true);
                } else { //If the available Date has a value
                    var availableDate = reviewRefreshClassSettings.get("availableDate"),
                            timeZone = reviewRefreshClassSettings.get("timeZone");
                    availableHourStr = dateUtil.format(reviewRefreshClassSettings.get("availableDateRound"), "HH,mm", timeZone);
                    component.set("startDateRR", dateUtil.format(availableDate, dateUtil.slashedShortDateFormat, timeZone));
                    component.set('startHourRR', availableHourStr);
                    $("#startHourRR").val(availableHourStr).trigger("change");
                    component.set("settings_radio", "custom");
                    $('.settings-section input[type=radio]:eq(1)').prop("checked", true)
                }
            }
        } else { //Is reviewRefreshClassSettings don't exist, need to create one.
            reviewRefreshClassSettings = store.createRecord("reviewRefreshClassSetting", {active: false,
                targetMasteryLevel: component.get("defaultML")});

            var record = SakuraiWebapp.ReviewRefreshClassSetting.createRRSettingsRecord(store, {
                reviewRefreshClassSettings: reviewRefreshClassSettings,
                class: component.get("_class")
            });

            record.then(function (_reviewRefreshClassSetting) {
                var promise = _reviewRefreshClassSetting.save();
                promise.then(function (result) {
                    component.set("reviewRefreshClassSettings", result);
                    component.set("settings_radio", "activeInactive");
                    $('.settings-section input[type=radio]:eq(2)').prop("checked", true);
                });
            });
        }
    },

    //----------------------------------
    //
    //----------------------------------
    manageSetting: function (section, value) {
        this.set(section, value)
        this.sendAction('data-change-settings', value);
        if (value)
            $("html, body").animate({scrollTop: 0}, "slow");
    },

    actions: {
        //----------------------------------
        // First Radio buttons option, Go to seetings or see the info about R&R
        //----------------------------------
        continueReviewRefreshActions: function () {
            var component = this;

            if (component.get("options_radio") == "change_settings") { //Show Settings Options
                component.initDatePicker();
                component.manageSetting("activeSettings", true);
                component.initSettings();
            } else { // Show More about Review and Refresh Info
                component.manageSetting("activeAbout", true);
            }
        },

        saveSettings: function () {

            var component = this,
                    reviewRefreshClassSettings = component.get("reviewRefreshClassSettings"),
                    dateUtil = new SakuraiWebapp.DateUtil();

            if (component.get("settings_radio") == "default") //Set Custom ML
            {
                reviewRefreshClassSettings.set("availableDate", undefined);
                reviewRefreshClassSettings.set("timeZone", "");

                var promise = reviewRefreshClassSettings.save();
                promise.then(function (result) {
                    component.manageSetting("activeSettings", false);
                });
            }

            if (component.get("settings_radio") == "custom") //Set Date and time
            {
                var date = $('#startDateRR').val() + " " + component.get("startHourRR");

                //dates are handle in local time, they are converted to UTC before sending the request
                var availableDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", reviewRefreshClassSettings.get("timeZone"));
                reviewRefreshClassSettings.set("availableDate", availableDate);
                reviewRefreshClassSettings.set("targetMasteryLevel", component.get("defaultML"));
                reviewRefreshClassSettings.set("active", true) //Set active value
                var promise = reviewRefreshClassSettings.save();
                promise.then(function (result) {
                    component.manageSetting("activeSettings", false);
                });
            }

            if (component.get("settings_radio") == "activeInactive") //Activer or Inactive
            {
                if (component.get("isON") && component.get("available")) {//Is active want to disactive
                    reviewRefreshClassSettings.set("availableDate", undefined); //Clean Date
                    reviewRefreshClassSettings.set("timeZone", ""); //Clean Hour
                    reviewRefreshClassSettings.set("targetMasteryLevel", component.get("defaultML")); //Set Default ML
                    reviewRefreshClassSettings.set("active", false) //Set active value

                    var promise = reviewRefreshClassSettings.save();
                    promise.then(function (result) {
                        component.manageSetting("activeSettings", false);
                    });

                } else if (!component.get("isON") || !component.get("available")) //Is OFF by the date or is inactive
                {
                    reviewRefreshClassSettings.set("availableDate", undefined); //Clean Date
                    reviewRefreshClassSettings.set("timeZone", ""); //Clean Hour
                    reviewRefreshClassSettings.set("targetMasteryLevel", component.get("defaultML")); //Set Default ML
                    reviewRefreshClassSettings.set("active", true) //Set active value

                    var promise = reviewRefreshClassSettings.save();
                    promise.then(function (result) {
                        component.manageSetting("activeSettings", false);
                    });
                }
            }

        },

        cancelSettings: function (section) {
            if (this.get("reviewRefreshClassSettings"))
                this.get("reviewRefreshClassSettings").rollbackAttributes();
            this.manageSetting(section, false);
        },

        /**
         * Sets the timezone from the select element
         * @param timezone
         */
        setTimeZone: function (timezone) {
            this.get("reviewRefreshClassSettings").set("timeZone", timezone);
        }

    }
});
