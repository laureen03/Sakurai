
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import Section from "sakurai-webapp/models/section";
import TermTaxonomy from "sakurai-webapp/models/term-taxonomy";

export default Ember.Controller.extend(
    ControllerMixin,
    FeatureMixin,{
    headerClasses: Ember.inject.controller(),
    queryParams: ['studentId'],

    /**
     * @property indicates student ID if the page is accessing by instructor
     */
    studentId: null,

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {Product} selected product
     */
    product: null,

    /**
     * @property {menuSelected} selected Menu
     */
    menuSelected: "",

    /**
     * @property {TermTaxonomyStat}  statistic information for taxonomy performance
     */
    termTaxonomyStats: null,

    /**
     * @property text body for the mastery modal
     */
    bodyMasteryModal: Ember.computed(function(){
        var nameProduct = this.get("product.name").replace(/-/g, "");
        var firstParagraph = I18n.t("haid." + nameProduct + ".bodyMasteryModalNCLEX", {defaultValue: I18n.t('haid.bodyMasteryModal1') + this.get("product").get('name') + I18n.t('haid.bodyMasteryModal2')});
        return '<p>' + firstParagraph + '</p>' + '<p>' + I18n.t('haid.bodyMasteryModal3') + '</p>';
    }),

    /**
     * @property text body for the chapter modal
     */
    bodyChapterModal: Ember.computed(function(){
        return  '<p>' + I18n.t('haid.bodyChapterModal') + '</p>' + '<p>' + I18n.t('haid.bodyChapterModal1') + '</p><p>'+ I18n.t('haid.bodyChapterModal2') +'</p>';
    }),

    /**
     * @property {OverallPerformance} overall performance information
     */
    overallPerformance: null,

    /**
     * @property {ChapterStat} chapter statistic information for chapter performance, weaknesses and strengths
     */
    chapterStats: null,

    /**
     * @property {AssignmentStat} assignment statistics
     */
    assignmentStats: null,

    /**
    * @property {string} set custom titles for modal of performance by taxomonies
    **/
    whatIsThisPerformanceTitle: "",


    /**
     * @property {bool} Indicates if the impersonated student header is enabled
     */
    impersonatedHeaderEnabled: Ember.computed("isImpersonated", "isInFrame", function(){
        return  this.get("isImpersonated") &&
                this.get("isInFrame");
    }),

    /**
     * @property {bool} Indicates if the framed class header is enabled
     */
    framedHeaderEnabled: Ember.computed("impersonatedHeaderEnabled", "isInFrame", "isCCMAllowed", function(){
        return  !this.get("impersonatedHeaderEnabled") &&
                !this.get("isCCMAllowed") &&
                this.get("isInFrame");
    }),

    /**
     * {bool} Indicates if the ccm view student roster is enabled
     */
    ccmViewStudentRosterEnabled: Ember.computed('isCCMAllowed', function(){
        var context = 
        context;
        var manager = context.get("authenticationManager");
        return this.get("isCCMAllowed") && !manager.get("deepLinking");
    }),


    /**
     * {bool} Indicates if the ccm join class is enabled
     */
    ccmJoinClassEnabled: Ember.computed('isCCMAllowed', function(){
        return this.get("isCCMAllowed");
    }),


    /**
     * {bool} Indicates if the go back button is enabled
     */
    ccmGoBackEnabled: Ember.computed(function(){
        var context = 
        context;
        var manager = context.get("authenticationManager");

        return !manager.get("deepLinking");
    }),

    /**
     * Resets controller values
     */
    resetValues: function(){
        var controller = this;
        controller.set("studentId", null); //Reset Student ID
    },

    /**
    *  Go to Section and select all weaknesses by default
    **/
    goToSectionWeaknest: function(){
        var controller = this;
        controller.get("chapterStats").get("weaknesses").then(function(result){
            var chapterList = result.mapBy('chapter.id').join('-');
            controller.transitionToRoute("/student/section/" + controller.get("class").get("id") + "?cs=" + chapterList);
        });
    },

    /**
    *  Go to Metadata and select all weaknesses by default
    **/
    goToMetadataWeaknest: function(list, type){
        var controller = this;
        controller.get("termTaxonomyStats").get(list).then(function(result){
            var clientNeedsList = result.mapBy('termTaxonomy.id').join('-');
            controller.transitionToRoute("/student/metadata/" + controller.get("class").get("id") + "?type="+type+"&ms=" + clientNeedsList);
        });
    },

    actions:{

        goBackToHMCD: function(){
            var classId = this.get("class").get("id");
            this.transitionToRoute("/instructor/hmcd/" + classId + "?scrollTo=studentUsage");
        },

        preSelect:function(id, type){
            var controller = this;
            if (this.get("isMetadataAllowed")){
                if (type !== Section.NURSING_TOPICS){
                    controller.transitionToRoute("/student/metadata/" + controller.get("class").get("id") + "?type="+type+"&ms=" + id);
                }
                else{
                    controller.transitionToRoute("/student/section/" + controller.get("class").get("id") + "?type="+type+"&cs=" + id);
                }
            }
            else{
                controller.transitionToRoute("/student/section/" + controller.get("class").get("id") + "?cs=" + id);
            }
        },

        selectWeakest: function(type){
            var controller = this;
            if (this.get("isMetadataAllowed")){
                if (type ===  Section.NURSING_TOPICS){
                     controller.goToSectionWeaknest(); //By Nursing Topics
                } else if (type === TermTaxonomy.CLIENT_NEEDS){
                    controller.goToMetadataWeaknest("clientNeedsWeaknesses", type); //By Client Needs
                }
                else{
                    controller.goToMetadataWeaknest("nursingConceptsWeaknesses", type); //By Nursing Concepts
                }
            }
            else{
                controller.goToSectionWeaknest(); //By Chapter
            }
        },

        openModalWhatisThis: function(modalId, labelTitle){
            var controller = this;
            controller.set("whatIsThisPerformanceTitle", I18n.t("haid.titlePerformanceModalCustom") + labelTitle + "?");
            $('#'+modalId).modal("show");
        }
    }
});
