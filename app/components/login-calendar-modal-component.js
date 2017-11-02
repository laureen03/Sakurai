/**
 * Component for displaying user login information in a calendar view within a modal window
 *
 * @extends Ember.Component
 *
 * @param component-class {string} special class to add to the component's tag (optional)
 * @param user {User} user for the corresponding login information (default: '')
 * @param login-data {SakuraiWebapp.Login} login information for a specific user
 * @param data-range {string} range of the login information. A string of the form:
 *                            YYYY-MM-DD:YYYY-MM-DD, where the first date refers to the start date and the
 *                            second date refers to the end date of the login infomation
 */

SakuraiWebapp.LoginCalendarModalComponent = Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['login-calendar-modal', 'modal', 'fade'],
    classNameBindings: ['component-class'],

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    isVisible: false,

    /*
     * @property {number} Months to buffer from the selected month (on changeMonth event)
     */
    monthsToBuffer: 3,

    /*
     * @property {Object} Buffer for storing login information in a map
     */
    _dateBuffer: {},

    userName: Ember.computed.alias('user.fullNameInformal'),

    totalLogins: Ember.computed.alias('login-data.totalLogins'),

    initialLogin: Ember.computed.alias('login-data.initialLogin'),

    logins: Ember.computed.alias('login-data.logins'),

    calendarStart: Ember.computed('initialLogin', function(){
        var date = this.get('initialLogin');

        date = moment(date, "YYYY-MM-DD HH:mm:ss");
        if (date.isValid()) {
            return date.toDate();
        }
    }),

    periodStart: Ember.computed('calendarStart', function(){
        var date = this.get('calendarStart');
        if (date) {
            return this.formatDate(date);
        }
    }),

    periodEnd: Ember.computed(function(){
        // Login report is done until today
        return this.formatDate(new Date());
    }),

    /*
     * === Methods ===
     */
    formatDate: function(date) {
        if (!(date instanceof Date)) {
            throw new Ember.Error('LoginCalendarModalComponent: date objected expected');
        }
        return moment(date).format('MMM D, YYYY');
    },

    updateDateBuffer: function(logins) {
        var dateBuffer = this.get('_dateBuffer'),
            i, loginObject, date, year, month, day;

        if (logins && logins.length) {
            for (i = 0; i < logins.length; i++) {
                loginObject = logins[i];
                date = moment(loginObject.date, "YYYY-MM-DD");
                year = date.year();
                month = date.month();
                day = date.date();

                if (!dateBuffer[year]) {
                    dateBuffer[year] = {};
                }
                if (!dateBuffer[year][month]) {
                    dateBuffer[year][month] = {};
                }
                dateBuffer[year][month][day] = loginObject.total;
                this.set('_dateBuffer', dateBuffer);
            }
        }
    },

    show: function() {
        var self = this,
            today = new Date();

        // Create a new calendar every time the modal is shown since the calendar
        // startDate may change among users
        this.$('.modal-body .calendar').datepicker({

            startDate: self.get('calendarStart'),

            endDate: today,

            defaultViewDate: today,

            beforeShowDay: function(date) {

                var dateBuffer = self.get('_dateBuffer'),
                    year = date.getFullYear(),
                    month = date.getMonth(),
                    day = date.getDate(),
                    dayLogins = dateBuffer[year] && dateBuffer[year][month] && dateBuffer[year][month][day];

                if (dayLogins) {
                    // The number of times a user has logged in a day is inserted into the calendar through CSS.
                    // A class 'num-<numLogins>' is applied to each day where numLogins != 0.
                    // Currently, this goes all the way to num-20. This means that if a student logs in
                    // more than 20 times in a day, more styles will need to be added to _login-calendar-modal.scss
                    return {
                        enabled: false,
                        classes: 'logins num-' + dayLogins
                    }
                }
                return false;
            }
        });

        this.$('.modal-body .calendar').datepicker().on('changeMonth', function(e) { 
            self.updateDataRange(e.date);
        });

        this.$().modal("show");
    },

    updateCalendar: function() {
        this.$('.modal-body .calendar').datepicker('update');
    },

    updateDataRange: function(date) {

        var yearSelected = date.getFullYear(),
            monthSelected = date.getMonth(),
            dateBuffer = this.get('_dateBuffer'),
            monthsToBuffer, startDate, endDate;

        if (!(dateBuffer[yearSelected] && dateBuffer[yearSelected][monthSelected])) {
            // If the year and month are not in the buffer, then update the data range:
            // 1st day of (currentMonth - monthsToBuffer) to last day of currentMonth
            monthsToBuffer = this.get('monthsToBuffer');
            startDate = moment([yearSelected, monthSelected]).startOf('month');
            startDate = startDate.subtract(monthsToBuffer, 'months');

            endDate = moment([yearSelected, monthSelected]).endOf('month');
            this.set('data-range', startDate.format('YYYY-MM-DD') + ':' + endDate.format('YYYY-MM-DD'));
        }
    },

    didInsertElement: function() {
        var self = this;
        self.set('_dateBuffer', {});
        // Add event listener
        this.$().on('hidden.bs.modal', function() {

            Ember.run( function() {
                // The modal is closed normally through the UI controls.
                // When the modal is closed, update the visibility control to keep the state consistent
                self.set('isVisible', false);

                // Reset modal content
                self.set('user', null);
                self.set('data-range', null);
                self.set('_dateBuffer', {});

                // Finally, destroy the calendar (it will be built again next time the modal is shown)
                self.$('.modal-body .calendar').datepicker('remove');
            });
        });
    },

    willDestroyElement: function() {
        this.$().off('hidden.bs.modal');
    },

    /*
     * === Observers ===
     */
    updateLoginData: Ember.observer('logins', function() {
        var loginData = this.get('logins');

        this.updateDateBuffer(loginData);

        if (typeof this.get('totalLogins') == 'number') {
            // When the modal is closed, 'data-range' becomes null. This should make the controller
            // clear the content of logins (logins = {}) and 'totalLogins' then becomes undefined.
            // In this case, the calendar should neither be created nor updated while the modal is closed.
            if (this.get('isVisible')) {
                this.updateCalendar();
            } else {
                this.show();
                this.set('isVisible', true);
            }
        }
    })

});
