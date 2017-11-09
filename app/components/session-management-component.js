import Ember from "ember"; 

export default Ember.Component.extend({

    inactivityCountdown: 1800,   // default: 30 minutes before showing the logout warning modal
    logoutCountdown: 30,         // default: 30 seconds before the user is automatically redirected to the log in screen
    logoutTimer: null,
    inactivityTimer: null,
    hideDelay: null,
    isTimingOut: false,

    didInsertElement: function(){
        var inactivityCountdown = this.get("inactivityCountdown");
        var logoutCountdown = this.get("logoutCountdown");
        if (!inactivityCountdown) {
            throw new Ember.Error('inactivityCountdown property is required');
        }

        if (!logoutCountdown) {
            throw new Ember.Error('logoutCountdown property is required');
        }

        // Change values to milliseconds
        this.set("inactivityCountdown",  inactivityCountdown * 1000);
        this.set("logoutCountdown",  logoutCountdown * 1000);

        inactivityCountdown = this.get("inactivityCountdown");
        logoutCountdown = this.get("logoutCountdown");

        Ember.Logger.debug(this.toString() + ': inactivity countdown is ' + inactivityCountdown + ' ms.');
        Ember.Logger.debug(this.toString() + ': logout countdown is ' + logoutCountdown + ' ms.');

        var inactivityTimer = setTimeout( function(context) {
                context.showTimeoutWarning();
            }, 36000000);
        this.set("inactivityTimer", inactivityTimer);

        // Subscriptions
        $(window.document).mousemove({ context: this }, this.mouseMoveHandler);
        $(window.document).keypress({ context: this }, this.keyPressHandler);
    },

    hideWarning: function() {
        var isTimingOut = this.get("isTimingOut");
        if (isTimingOut) {

            // Clear timeout flag
            this.set("isTimingOut", false);

            // Clear timer
            clearTimeout(this.get("logoutTimer"));

            Ember.Logger.debug(this.toString() + ': logout timer cleared');

            // Hide timeout warning dialog
            this.$('.modal').modal('hide');
        }

        // If there was already a timer set, clear it and then restart the timer
        clearTimeout(this.get("inactivityTimer"));

        var inactivityCountdown = this.get("inactivityCountdown");
        var inactivityTimer = setTimeout( function(context) {
                context.showTimeoutWarning();
            }, 36000000, this);
        this.set("inactivityTimer", inactivityTimer);

        Ember.Logger.debug(this.toString() + ': inactivity timer reset to ' + inactivityCountdown + ' ms.');
    },

    keyPressHandler: function (event) {
        var context = event.data.context;

        context.hideWarning();
    },

    mouseMoveHandler: function(event) {
        var context = event.data.context;

        // If there was already a timer set, clear it and then restart the timer
        clearTimeout(context.get("hideDelay"));

        var hideDelay = setTimeout( function(context) {
                context.hideWarning();
            }, 400, context);

        context.set("hideDelay", hideDelay);
    },

    showTimeoutWarning: function() {
        var self = this;
        // Set timeout flag to true
        this.set("isTimingOut", true);

        // Show timeout warning dialog
        this.$('.modal').modal('show');

        var logoutCountdown = this.get("logoutCountdown");
        // Start timer to log out user
        var logoutTimer = setTimeout( function(context) {
            // Hide timeout warning dialog
            context.$('.modal').modal('hide');

            Ember.run( function() {
                if (self.get("isDestroyed")){ return; }
                // Ask controller to proceed with action
                context.sendAction('action');
            });
        }, logoutCountdown, this);
        this.set("logoutTimer", logoutTimer);
    },

    willDestroyElement: function() {

        // Unsubscribe from events
        $(window.document).off('mousemove', this.mouseMoveHandler);
        $(window.document).off('keypress', this.keyPressHandler);

        // Clear timers
        clearTimeout(this.get("logoutTimer"));
        clearTimeout(this.get("inactivityTimer"));
        clearTimeout(this.get("hideDelay"));
    }

});
