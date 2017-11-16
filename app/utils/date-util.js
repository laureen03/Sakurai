import Ember from 'ember';
import DateUtil from 'sakurai-webapp/utils/date-util';

export default Ember.Object.extend({
    /**
     * @property string default time zone for dates
     */
    defaultTimezone: "America/New_York",

    timeFormat: "HH:mm",
    slashedShortDateFormat : "MM/DD/YYYY",
    shortDateFormat : "MM-DD-YYYY",
    longDateFormat : "MM-DD-YYYY HH:mm a",
    graphFormat: "MM/DD/YY",
    HM: "HM",
    hms: "hms",
    dhms: "dhms",

    /**
     * Formats a date into a string
     * @param {Date} date
     * @param {string} format
     * @param {string} timezone
     * @param {boolean} appendTimeZone
     * @returns {*}
     */
    format: function(date, format, timezone, appendTimeZone){
        appendTimeZone = appendTimeZone || false;
        if (date instanceof Date) {
            format = format || moment.defaultFormat;
            timezone = timezone || this.defaultTimezone;
            var formatted = moment(date).tz(timezone).format(format);
            return appendTimeZone ? (formatted + " " + this.zoneAbbr(timezone, date)) : formatted;
        }
    },
    /**
     * Parses a date string into a js Date
     * @param {string} date
     * @param {string} format
     * @param {string} timezone
     * @returns {*}
     */
    parse: function(date, format, timezone){
        format = format || moment.defaultFormat;
        if (date) {
            timezone = timezone || this.defaultTimezone;
            return moment(date, format).tz(timezone).toDate();
        }
    },

    /**
     * Format a date to UTC
     * @param {Date} date
     * @param {String} format
     */
    formatToUtc: function(date, format){
        format = format || moment.defaultFormat;
        if (date instanceof Date) {
            format = format || moment.defaultFormat;
            return moment(date).utc().format(format);
        }

    },

    /**
     * Parses a date string in utc to local date
     * @param {String} date
     * @param {String} format
     * @returns {Date}
     */
    parseUtcToLocal: function(date, format){
        format = format || moment.defaultFormat;
        if (date) {
            return moment.utc(date, format).toDate();
        }
    },

    /**
     * Converts a specific date in a timezone to the local date - browser timezone
     * @param {String} date
     * @param {String} format
     * @param {String} timezone
     * @returns {Date} Local date
     */
    toLocal: function(date, format, timezone){
        format = format || moment.defaultFormat;
        return  moment.tz(date, format, timezone).toDate();
    },

    /**
     * Returns the zone abbreviation for the provided name
     * @param {string} zoneName
     * @param {Date} date
     * @returns {string} abbr
     */
    zoneAbbr: function(zoneName, date){
        date = date || new Date();
        zoneName = zoneName || DateUtil.getLocalTimeZone();
        var zone = moment.tz.zone(zoneName);
        return (zone) ? zone.abbr(date): "";
    },

    /**
    *  Convert Minutes or Second To Time, with specific Format
    *  Format HM return X hours X min 
    *  Format hms return Xh Xm Xs
    *  Format dhms return Xd Xh Xm Xs
    *  Only allow Seconds and Minutes
    **/
    convertToTimeStringWithFormat: function(value, base, format){
        var controller = this;
        var x = (base === "minutes") ? (value * 60) : value;
        var d = moment.duration(x, 'seconds');
        var hours = Math.floor(d.asHours());
        var mins = Math.floor(d.asMinutes()) - hours * 60;
        var time = "";
        var sec = null;

        switch(format) {
            case controller.get("HM"): //Create Format -> X hours X min 
                if (hours !== 0){
                    time = (hours === 1) ? hours + " hour " : hours + " hours ";
                }
                if (mins!==0){
                    time += mins + " min";
                }
                break;
            case controller.get("hms"): //Create Format -> Xh Xm Xs
                sec = Math.floor(d.asSeconds()) - (hours * 3600) - (mins * 60);
                if (hours !== 0){
                    time = hours + "h ";
                }
                 
                if (mins!==0){
                    time += mins + "m ";
                }

                if (sec!==0){
                    time += sec + "s";
                }
                break;
            case controller.get("dhms"):
                var days = Math.floor(d.asDays());
                hours = Math.floor(d.asHours()) - days * 24;
                mins = Math.floor(d.asMinutes()) - days * 24 * 60 - hours * 60;
                sec = Math.floor(d.asSeconds()) - (days * 24 * 60 * 60) - (hours * 3600) - (mins * 60);
                if (days !== 0){
                    time += days + "d ";
                }

                if (hours !== 0){
                    time += hours + "h ";
                }

                if (mins !== 0){
                    time += mins + "m ";
                }

                if (sec !== 0){
                    time += sec + "s";
                }
                break;
        } 
        return time;
    }
});

DateUtil.reopenClass({
    /**
     * Get supported timezones
     * @returns {*}
     */
    getTimeZones: function(){
        var timezones = Ember.A([
            "Asia/Tokyo",
            "Australia/Sydney",
            "Australia/Adelaide",
            "Australia/Perth",
            "Asia/Kolkata",
            "Europe/Athens",
            "Africa/Johannesburg",
            "Europe/Berlin",
            "Europe/London",
            "US/Alaska",
            "US/Eastern",
            "US/Central",
            "US/Mountain",
            "US/Arizona",
            "US/Pacific",
            "US/Hawaii"
        ]);

        return timezones;
    },

    /**
     * Returns the browser timezone
     * @returns {string}
     */
    getLocalTimeZone: function(){
        var timeZones = DateUtil.getTimeZones();
        var timezone = "US/Eastern"; //default is US/Eastern
        var localZone = moment().zone();
        timeZones.forEach(function(name){
            if (moment().tz(name).zone() === localZone){
                timezone = name;
            }
        });
        return timezone;
    }

});
