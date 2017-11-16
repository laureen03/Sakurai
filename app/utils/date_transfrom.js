import DS from 'ember-data';
import DateUtil from 'sakurai-webapp/utils/date-util';

/**
 * Overriding default DateTransform to follow isoFormat = 'YYYY-MM-DDTHH:mm:ssZ'
 */
DS.DateTransform.reopen({

    serialize: function (date) {
        //all dates are serialized and sent to the serve in UTC
        return (new DateUtil()).formatToUtc(date);
    },

    deserialize: function (date) {
        //all dates received from the server are in UTC, they are parse to local time - browser time zone
        return (new DateUtil()).parseUtcToLocal(date);
    }
});