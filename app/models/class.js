import DS from 'ember-data';
import Ember from "ember";
import Class from "../models/class";

export default DS.Model.extend({
    name: DS.attr('string'),
    term: DS.attr('string'),
    product: DS.belongsTo('product', { async: true }),
    classCode: DS.attr("string"),
    active: DS.attr("boolean"),
    startDate: DS.attr("date"),
    endDate: DS.attr("date"),
    school: DS.belongsTo('school', { async: true }),
    owner: DS.belongsTo('user', { async: true }),
    internal: DS.attr("boolean"),
    externalId: DS.attr("string"),
    classExamOverallSettings: DS.belongsTo('classExamOverallSetting', { async: true}),
    reviewRefreshClassSetting: DS.belongsTo('reviewRefreshClassSetting', { async: true}),
    instructors: DS.hasMany('user', {async: true}),

    /*
    * Indicate if the class is Self study
    */
    selfStudying: Ember.computed('internal', function(){
        return this.get("internal");
    }),

    isUnknownTerm: Ember.computed('term', function(){
        return (this.get("term") === "unknown");
    }),

    hideThresholdLabels: Ember.computed('classExamOverallSettings', function(){
        //return 1;
        var classExamOverallSettings = this.get("classExamOverallSettings");
        return classExamOverallSettings.get("hideThresholdLabels");

    }),

    customThreshold: Ember.computed('classExamOverallSettings', function(){
        //return 4;
        var classExamOverallSettings = this.get("classExamOverallSettings");
        return classExamOverallSettings.get("customThreshold");
    })

});

/**
 * Adds convenience methods to the Class model
 */
Class.reopenClass({

    /**
     * Retrieves all active classes by publisher and user
     * #param {DS.Store} store
     * @param {int} publisherId
     * @param {int} userId
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    getActiveClassesByPublisherAndUser: function(store, publisherId, userId){
        return this.getClassesByPublisherAndUser(store, publisherId, userId, "active");
    },

    /**
     * Retrieves all active classes by product and user
     * #param {DS.Store} store
     * @param {int} productId
     * @param {int} userId
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    getActiveClassesByProductAndUser: function(store, productId, userId){
        return this.getClassesByProductAndUser(store, productId, userId, "active");
    },

    /**
     * Retrieves all classes by product and user
     * #param {DS.Store} store
     * @param {int} productId
     * @param {int} userId
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    getAllClassesByProductAndUser: function(store, productId, userId){
        return this.getClassesByProductAndUser(store, productId, userId, "all");
    },

    /**
     * Retrieves classes by product and user
     * #param {DS.Store} store
     * @param {int} productId
     * @param {int} userId
     * @param {string} status
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    getClassesByProductAndUser: function(store, productId, userId, status){
        status = status || "all";
        return store.query("class",
            {
                userId: userId,
                productId: productId,
                status : status
            });
    },

    /**
     * Retrieves all classes by publisher and user
     * #param {DS.Store} store
     * @param {int} publisherId
     * @param {int} userId
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    getAllClassesByPublisherAndUser: function(store, publisherId, userId){
        return this.getClassesByPublisherAndUser(store, publisherId, userId, "all");
    },

    /**
     * Retrieves the classes by publisher, student and status
     * #param {DS.Store} store
     * @param {int} publisherId
     * @param {int} userId
     * @param {string} status active|inactive|all
     *
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    getClassesByPublisherAndUser: function(store, publisherId, userId, status){
        status = status || "all";
        return store.query("class",
            {
                userId: userId,
                publisherId: publisherId,
                status : status
            });
    },

    /**
     * Creates a new quiz record
     * @param store
     * @param data quiz data
     */
    createClassRecord: function(store, data){
        return new Ember.RSVP.Promise(function(resolve){
            var ownerId = data.owner.get('id');
            var _class = data.class;

            Ember.RSVP.Promise.all([
                    store.find("product", data.productId),
                    store.find("school", data.schoolId),
                    store.find("user", ownerId),
                ]).then(function (values) {
                    var product = values[0];
                    var school = values[1];
                    var owner = values[2];
                    _class.set('product', product);
                    _class.set('school', school);
                    _class.set('owner', owner);
                    resolve(_class);
                });
        });
    }
});
