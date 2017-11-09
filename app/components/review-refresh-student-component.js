import Ember from "ember"; 
import ReviewRefreshClassSetting from "models/review-refresh-class-setting";
import context from "utils/context-utils";

export default Ember.Component.extend({
    "data-class": null,

    "data-product": null,

    "data-parent-name": "",

    "data-set-inactive": "onSetInactive",

    /*
     * Property {reviewRefreshClassSetting} Manage the quiz type radio
     */
    reviewRefreshClassSettings: null,

    /**
     * @property if Quiz Review and Refresh is active.
     */
    activeRR: null,

    /**
     * @property history of to route
     */
    history: null,

    /*
     * Property {Boolean} Manage if the date is active
     */
    validDate: true,

    metadata: null,

    quizType: null,

    /*
     * Property {Boolean} If quiz type is set by initiation
     */
    autoQuizType: true,

    getDisableTopics: Ember.observer('quizType', function () {
        var component = this;
        if (this.isDestroyed || this.isDestroying) {
            return;
        }
        if (this.get("quizType") === 'adaptive'){ //All sections are available, Clear inactive list
            component.sendAction('data-set-inactive', [], false, component.get('autoQuizType'));
        } else { //Review and Refresh quiz
            var authenticationManager = context.get('authenticationManager'),
                    user = authenticationManager.getCurrentUser(),
                    inactive_topics = [];
            var targetML = component.get("data-class.selfStudying") ? component.get("data-product.reviewAndRefreshML") : component.get("reviewRefreshClassSettings.targetMasteryLevel");

            if (component.get("retrieveTaxonomies")){ //when is taxonomy list
                if (component.get("data-parent-name")){
                    inactive_topics = ReviewRefreshClassSetting.disabledReviewRefreshTaxonomies(component.get("data-class.id"), user.get("id"), targetML, component.get("data-parent-name"));
                }
                else{
                    return;
                }
            }
            else {//When are sections
                inactive_topics = ReviewRefreshClassSetting.disabledReviewRefreshSections(component.get("data-class.id"), user.get("id"), targetML);
            }

            inactive_topics.then(function (result) {
                if (component.get("quizType") === 'reviewRefresh') {
                    var ids = (component.get("retrieveTaxonomies")) ? result.taxonomiesIds : result.sectionsIds;
                    var flag = JSON.parse(component.get("activeRR"));
                    if (!flag || component.get('isNotFromPracticeQuiz')) {
                        $('#warningTopicsAreasReviewRefresh').modal('show');
                    }
                    if (ids && ids.length > 0){ //show message with warning about disable topics
                        component.sendAction('data-set-inactive', ids, true, component.get('autoQuizType'));
                    } else {
                        component.sendAction('data-set-inactive', [], true, component.get('autoQuizType'));
                    }
                }
            });
        }
        component.set('autoQuizType', false);
    }),

    retrieveTaxonomies: Ember.computed('quizType', function(){
        var component = this;
        return component.get("data-parent-name") !== "" && component.get("data-parent-name") !== 'nursing_topics';
    }),

    /**
     * Review the history
     **/
    isNotFromPracticeQuiz: Ember.computed('history', function(){
        var history = this.get('history'), lastPageVisited = "";
        if (history.length > 1){ //If the user visited more than one page
            lastPageVisited = history[history.length-2];
            if ((lastPageVisited === 'student.section') || (lastPageVisited === 'student.metadata')){ //Verify the last page is practice quiz
                return false; //The user change the dropdown
            } else {
                return true; //The user
            }
        }
        else{
            return false; //The user is into Practice quiz
        }
    }),

    getAllSectionsAvailable: Ember.observer('data-parent-name', function () {
        if (this.get('data-parent-name') !== 'nursing_topics'){
            this.getDisableTopics();
        }
    }),

    /**
     * Review and Refresh is active
     **/
    isActive: Ember.computed('reviewRefreshClassSettings', function(){
        //Compare dates
        var reviewRefreshClassSettings = this.get("reviewRefreshClassSettings");
        var validDate = true;

        if (reviewRefreshClassSettings && reviewRefreshClassSettings.get("availableDate")) {
            var availableDate = reviewRefreshClassSettings.get("availableDate");
            var now = new Date();
            if (availableDate.valueOf() > now.valueOf()) {
                validDate = false;
            }
        }

        this.set("validDate", validDate);
        return (this.get("data-class.selfStudying") && this.get("data-product.reviewAndRefreshML")) || (reviewRefreshClassSettings && this.get("reviewRefreshClassSettings.active") && validDate);
    }),

    /**
     * Whether or not to show R&R inactive message
     **/
    showInactiveMsg: Ember.computed('isActive', function(){
        return (!this.get("isActive") && !this.get("data-class.selfStudying"));
    }),

    /**
     *Allow review and refresh Product Settings
     **/
    allowReviewAndRefresh: Ember.computed('data-product', function(){
        return this.get("data-product.isRRAllowed");
    }),

    /**
     *Allow review and refresh Product Settings
     **/
    reviewAndRefreshWarningTranslationLabel: Ember.computed('data-product', function(){
        return "reviewRefresh." + (this.get("data-class.selfStudying") ? "attentionTopicsAreasSelfStudy" : "attentionTopicsAreas");
    }),

    /**
     * @property text body for "About Review and Refresh" modal
     */
    bodyAboutReviewAndRefresh: Ember.computed(function(){
        if (this.get("data-class.selfStudying")) {
            return '<p>' + I18n.t('reviewRefresh.studentAbout1') + '</p><p>' + I18n.t('reviewRefresh.studentAbout2SelfStudy') + '</p><p>' + I18n.t('reviewRefresh.studentAbout3') + '</p><p>' + I18n.t('reviewRefresh.studentAbout4') + "</p>";
        } else {
            return '<p>' + I18n.t('reviewRefresh.studentAbout1') + '</p><p>' + I18n.t('reviewRefresh.studentAbout2') + '</p><p>' + I18n.t('reviewRefresh.studentAbout3') + '</p><p>' + I18n.t('reviewRefresh.studentAbout4') + "</p>";
        }
    }),


    didInsertElement: function() {
        this._super();
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
    },

    afterRenderEvent: function () {
        var isReviewAndRefresh = JSON.parse(this.get("activeRR"));

        if (isReviewAndRefresh && !this.get("isActive")) { //When review and refresh is active but now is OFF
            this.set("quizType", "adaptive"); //Change to adaptive
            $('#adaptiveLearning').prop("checked", true);
        }else if (isReviewAndRefresh && this.get("isActive")) { //When review and refresh is active and is ON
            this.set("quizType", "reviewRefresh");
            $('#reviewAndRefresh').prop("checked", true);
        }else{
            this.set("quizType", "adaptive");
            $('#adaptiveLearning').prop("checked", true);
        }
    }
});
