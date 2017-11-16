import DS from 'ember-data';
import Ember from "ember";
import ReviewRefreshClassSetting from "sakurai-webapp/models/review-refresh-class-setting";
import context from 'sakurai-webapp/utils/context';

export default DS.Model.extend({
	/**
	* @property {Class} Current Class Information
	**/
    class: DS.belongsTo('class', { async: true }),

    /**
     * @property {date} assignment available date
     */
    availableDate: DS.attr('date'),

    /**
     * @property {string} assignment time zone
     */
    timeZone: DS.attr('string'),

    /**
     * @property {string} assignment time zone
     */
    targetMasteryLevel: DS.attr('number'),

    /**
     * @property {bool} assignment time zone
     */
    active:  DS.attr('boolean'),

    /**
      * Round the minute to 00 or 30 in Available Date
     */
    availableDateRound: Ember.computed('availableDate', function(){
        var date = this.get("availableDate");
        date.setMinutes(date.getMinutes() >= 30? 30 : 0);
        return date;
    }),
});

ReviewRefreshClassSetting.reopenClass({

    /**
     * Creates a RR Settings Record
     * @param store
     * @param ReviewRefreshClassSetting data
     */
    createRRSettingsRecord: function(store, data){
        return new Ember.RSVP.Promise(function(resolve){
            var classId = data.class.get('id');
            var _reviewRefreshClassSettings = data.reviewRefreshClassSettings;

            Ember.RSVP.Promise.all([
                    store.find("class", classId)
                ]).then(function (values) {
                    var _class = values[0];
                    _reviewRefreshClassSettings.set('class', _class);
                    resolve(_reviewRefreshClassSettings);
                });
        });
    },

    /**
     * Get Ids for Disable R&R Sections
     * @param {number} classId
     * @param {number} studentId
     * @param {number} targetMasteryLevel
     * @returns {Ember.Array} Id of disable Sections
     */
    disabledReviewRefreshSections: function (_classId, _studentId, _targetMasteryLevel){
        return new Ember.RSVP.Promise(function(resolve, reject){
            /*
             Was better Created a new ajax endpoint to avoid manipulate section list.
             */
            var url = Context.getBaseUrl() + "/reviewRefreshSections/disabledReviewRefreshSections";
            var data = { classId: _classId, studentId: _studentId, targetMasteryLevel: _targetMasteryLevel };

            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: data,
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });

    },

    /**
     * Get Ids for Disabled R&R Taxonomies
     * @param {number} classId
     * @param {number} studentId
     * @param {number} targetMasteryLevel
     * @param {String} parentName 
     * @returns {Ember.Array} Id of disable Taxonomies
     */
    disabledReviewRefreshTaxonomies: function (_classId, _studentId, _targetMasteryLevel, _parentName){
        return new Ember.RSVP.Promise(function(resolve, reject){
            /*
             Was better Created a new ajax endpoint to avoid manipulate section list.
             */
            var url = Context.getBaseUrl() + "/reviewRefreshTaxonomies/disabledReviewRefreshTaxonomies";
            var data = { classId: _classId, studentId: _studentId, targetMasteryLevel: _targetMasteryLevel , parentName: _parentName};

            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: data,
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });

    }


});