/**
 * Component for displaying a timer
 *
 * @extends Ember.Component
 *
 * @depends Moment.js
 *
 * @param data-component-class {string} special class to add to the component's tag (optional)
 * @param data-start-time {number} time to count from (in seconds).
 * @param data-end-time {number} time to count to (in seconds). (default: false)
 * @param data-countdown {boolean} does the timer count down? (default: false)
 * @param data-format {string} format string in which to show the time (see http://momentjs.com/docs/#/displaying/) (default: hh:mm:ss)
 * @param data-hide {boolean} add class for displaying the timer? (default: false)
 * @param data-hide-link {boolean} add link to toggle the 'data-hide' property (default: false)
 * @param data-label {string} text label for the timer (optional)
 * @param data-show-label {string} text label to show when the timer is hidden (optional)
 * @param action {string} action to trigger in the targetObject (optional)
 * @param data-stop {boolean} should the timer be stopped (optional)
 */

import Ember from "ember"; 

export default Ember.Component.extend({

    tagName: 'div',

    classNames: ['sakurai-timer'],
    classNameBindings: ['data-component-class', 'data-hide:short:full'],

    'data-component-class': '',
    'data-countdown': false,
    'data-format': 'HH:mm:ss',
    'data-show-label': 'common.showTime',
    'data-stop': false,
    'time': 0,

    /**
     * @property how often should the timer be refreshed (value in milliseconds)
     */
    'time-refresh-interval': 1000,

    /**
     * @property ID of the internal interval timer
     */
    _timerId: null,

    _initTimer: function() {
        if ( (this.get('isDestroyed') || this.get('isDestroying')) ){ return; }

        if (!moment) {
            throw new Ember.Error("Global variable \'moment\' is missing. Moment.js library may be missing.");
        }
        if (this.get('data-countdown')) {
            if (!this.get('data-start-time')) {
                throw new Ember.Error("Parameter \'data-start-time\' is not set. It must always be set when counting down.");
            }
        }
        this.start();
    },

    _start: function() {
        if ( (this.get('isDestroyed') || this.get('isDestroying')) ){ return; }
        // Preserve the state of the timer within the closure
        var self = this,
            time = this.get('data-start-time'),
            timeLimit = this.get('data-end-time'),
            timeout = this.get('time-refresh-interval'),
            inc;

        if (this.get('data-countdown')) {
            time = time ? time : 1;
            inc = -1;

            if (timeLimit && timeLimit >= time) {
                throw new Ember.Error("Time limit is set but it is unreachable (on countdown). \'data-end-time\' must be less than \'data-start-time\'");
            } else {
                timeLimit = timeLimit ? timeLimit : 0;
            }

        } else {
            time = time ? time : 0;
            inc = 1;

            if (timeLimit && timeLimit <= time) {
                throw new Ember.Error("Time limit is set but it is unreachable. \'data-end-time\' must be greater than \'data-start-time\'");
            } else {
                timeLimit = timeLimit ? timeLimit : 0;
            }
        }

        Ember.run( function() {
            // Finally set initial time after validations
            if ( (self.get('isDestroyed') || self.get('isDestroying')) ){ return; }
            self.set('time', time);
        });

        return function timeUpdate () {

            if ( (self.get('isDestroyed') || self.get('isDestroying')) ){ return; }

            var startTime = self.get('data-start-time') || 0,
                timerId;

            if (startTime !== time) {

                // data-start-time value was changed.
                // Restart the timer
                Ember.run( function() {
                    self.start();
                });

            } else {

                // data-start-time value has not been changed in
                // the controller. Carry on counting ...
                time += inc;

                Ember.run.next(self, function() {
                    // We call run.next to make sure that the previous run loop that
                    // sets the time value (i.e. self.set('time', time)) has completed
                    // before we update it

                    this.set('time', time);
                    this.set('data-start-time', time);

                    if (time !== timeLimit) {

                        // Renew the timer to keep counting
                        timerId = setTimeout(timeUpdate, timeout);
                        this.set('_timerId', timerId);

                    } else {

                        // Clear timer
                        clearTimeout(this.get('_timerId'));

                        if (this.get('action')) {
                            this.sendAction();
                        }
                    }
                });
            }
        };
    },

    stop: function() {
        if ( (this.get('isDestroyed') || this.get('isDestroying')) ){ return; }
        clearTimeout(this.get('_timerId'));
    },

    start: function () {
        if ( (this.get('isDestroyed') || this.get('isDestroying')) ){ return; }
        var updateTimeFunc = this._start(),
            timerId;
        var self = this;
        // Start running the timer after the page has been rendered
        Ember.run.schedule('afterRender', this, function() {
            if ( (self.get('isDestroyed') || self.get('isDestroying')) ){ return; }
            timerId = setTimeout(updateTimeFunc, this.get('time-refresh-interval'));
            this.set('_timerId', timerId);
        });
    },

    toggle: Ember.observer('data-stop', function () {

        if ( (this.get('isDestroyed') || this.get('isDestroying')) ){ return; }

        var stopTimer = this.get('data-stop');

        if (stopTimer) {
            this.stop();
        } else {
            this.start();
        }
    }).on('change'),

    /**
     * @return 'data-start-time' value formatted per the 'data-format' parameter
     */
    timeString: Ember.computed('time', 'data-format', function(){
        var time = this.get('time');

        return moment().startOf('day').seconds(time).format(this.get('data-format'));
    }),

    /*
     * === EVENTS
     */
    didInsertElement: function() {
        // this._controller = this.get('controller');
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions: function () {
        this._initTimer();
    },

    willDestroyElement: function() {
        if ( (this.get('isDestroyed') || this.get('isDestroying')) ){ return; }
        clearTimeout(this.get('_timerId'));
    },

    actions: {
        toggleView: function() {
            this.toggleProperty('data-hide');
        }
    }
});
