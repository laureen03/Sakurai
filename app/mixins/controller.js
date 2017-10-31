
import Ember from "ember";
import SortableMixin from '../mixins/sortable';
import Context from '../utils/context-utils';
import MobileUtil from '../utils/mobile-util';
import ReviewRefreshClassSetting from '../models/review-refresh-class-setting';

/**
 * This mixing contains convenience methods for all controllers using it
 */
export default Ember.Mixin.create(
    SortableMixin, {

     context: Ember.computed(function(){
         return Context;
     }),


    applicationModule: Ember.computed.alias('context.applicationModule'),

    /**
     * @property logged user
     */
    user: Ember.computed.alias('context.authenticationManager.authKey.user'),

    /**
     * @property {string} product isbn for sso users
     */
    isbn: Ember.computed.alias('context.authenticationManager.isbn'),

    /**
     * @property {bool} indicates if it is a sso session
     */
    sso: Ember.computed.alias('context.authenticationManager.sso'),

    /**
     * @property {bool} indicates if it is a mimic user session
     */
    mimic: Ember.computed.alias('context.authenticationManager.mimic'),

    /**
     * @property {string} product isbn for sso users
     */
    isStudentView: Ember.computed.alias('context.authenticationManager.isStudentView'),

    /**
     * Indicates if the app is in a frame
     * @property {bool}
     **/
    isInFrame: Ember.computed.alias('context.isInFrame'),

    /**
     * Indicates if the app is in a mobile device
     * @property {bool}
     */
    isInMobile: Ember.computed.alias('context.isInMobile'),

    /**
     * Indicates if another student is impersonated at this moment
     * @propety {bool}
     */
    isImpersonated: Ember.computed.alias('context.authenticationManager.isImpersonated'),

    /**
     * Indicate the taxonomy tag parameter if it exist
     * @propety {string}
     */
    taxonomyTag: Ember.computed.alias('context.authenticationManager.taxonomyTag'),

    /**
     * Indicates when the application is loading data
     * @propety {bool}
     */
    isLoading: Ember.computed.alias('context.isLoading'),

    /**
    * Simple Array with routes history.
    * @property {array}
    **/
    history: [],

    /**
     * Indicates when the application is x small
     * @propety {bool}
     */
    isXSmall: Ember.computed(function(){
        return MobileUtil.xSmall();
    }),

    /**
     * Returns the impersonated user
     * @property {SakuraiWebapp.User}
     */
    impersonatedUser: Ember.computed("isImpersonated", function(){
        var controller = this;
        var authenticationManager = Context.get('authenticationManager');
        var store = controller.store;

        return store.find("user", authenticationManager.get("impersonatedId"));
    }),



    /**
     * Sorts a table by criteria
     * This is a default implementation, this could be override if necessary
     * @param sortableId the sortable identifier
     * @param criteria
     */
    sortByCriteria: function(sortableId, criteria){
        var controller = this;

        //it expects to have a variable in the controller like {sortableId}Sortable
        var sortable = controller.get(sortableId + "Sortable");

        //it expects a table element having the class {sortableId}-table
        var tableElement = $("." + sortableId + '-table');

        //it replaces any . in the criteria (i.e user.name) for _ (user_name)
        //it expects a column having a class .sort_{criteria}
        var criteriaSelector = ' .sort_' + criteria.replace(".", "_");

        var descending = $(criteriaSelector, tableElement).find('span').hasClass('headerSortUp');
        sortable.set('direction', descending);
        sortable.set('sort', criteria);

        if(descending){
            $('.headerSortUp', tableElement).removeClass('headerSortUp');
            $(criteriaSelector, tableElement).find('span').addClass('headerSortDown');
        }else{
            $('.headerSortUp', tableElement).removeClass('headerSortUp');
            $('.headerSortDown', tableElement).removeClass('headerSortDown');
            $(criteriaSelector, tableElement).find('span').addClass('headerSortUp');
        }
    },
    
    openCreateQCMdl: function() {
        $('#createql-mdl').modal('show');
    },

    //Set review refresh class setting active by default
    defaultReviewRefreshClassSetting: function(product, clazz) {
        if (product.get('isRRAllowed') && !clazz.get('reviewRefreshClassSetting').get('targetMasteryLevel')) {
            var controller = this;
            var store = controller.get("store");
            var reviewRefreshClassSettings = store.createRecord("reviewRefreshClassSetting", {active: true,
                targetMasteryLevel: product.get("reviewAndRefreshML")});

            var record = ReviewRefreshClassSetting.createRRSettingsRecord(store, {
                reviewRefreshClassSettings: reviewRefreshClassSettings,
                class: clazz
            });

            record.then(function (_reviewRefreshClassSetting) {
                _reviewRefreshClassSetting.save();
            });
        }
    },

    actions:{
        openCreateQC:function(){
            this.openCreateQCMdl();
        }
    }


});