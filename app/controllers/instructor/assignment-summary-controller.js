import Controller from '@ember/controller';
import Ember from 'ember';
import DS from 'ember-data';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import SortableHelper from "mixins/sortable";
import TermTaxonomy from 'models/term-taxonomy';
import Product from 'models/product';


export default Controller.extend(
    ControllerMixin,
    FeatureMixin, {
    headerClasses: Ember.inject.controller(),

    /**
     * @property {Assignment} selected assignment
     */
    assignment: null,

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {ChapterStat or TermTaxonomyStats}  statistic information for chapter or taxonomy performance
     */
    stats: null,

    /**
     * @property {String} tooltip label text
     */
    autoCompletedDescription: I18n.t("assignments.autoCompletedDescription"),

    /**
     * @property conveniecne method for testing the existance of chpaters
     */
    hasChapter : Ember.computed('assignment.chapters.[]', function(){
        return this.get('assignment').get('hasChapter');
    }),

    /**
     * @property return if the assignment is metadata and has chapters
     */
    isTermTaxonomyNursingTopic: Ember.computed('assignment.chapter','isMetadataAllowed', function(){
        return this.get('isMetadataAllowed') && this.get('assignment').get('hasChapter');
    }),

    nursingTaxonomyPerformances: function(){
        var controller = this;
        return DS.PromiseArray.create({
            promise: new Ember.RSVP.Promise(function(resolve){
                controller.get("stats").get("termTaxonomyPerformances").then(function(termTaxonomyPerformances){
                    var promises = controller.get("stats").get("termTaxonomies");

                    Ember.RSVP.all(promises).then(function(){
                        resolve(termTaxonomyPerformances.filterBy("isNursingConcepts", true));
                    });
                });
            })
        });},

    statsPerformance: Ember.computed('stats', function(){
        var controller = this;
        if (controller.get("isMetadataAllowed") && !this.get('hasChapter')){
            return controller.get("stats").get("termTaxonomyPerformances");
        }
        else{
            return controller.get("stats").get("chapterPerformances");
        }
    }),

    /**
     * @property {ChapterStat} chapter statistics on selected assignment
     */
    chapterStats: null,

    /**
     * @property {SortableHelper|StudentResult[]} sortable for assignments
     */
    studentResultsSortable: null,

    /**
     * @property Selected term taxonomy value for dynamic term name
     */
    selectedTermTaxonomy: null,

    /**
     * @property {String} Product passing threshold lower limit
     */
    thresholdLowerLimit: 0,

    /**
     * @property {String} Product passing threshold upper limit
     */
    thresholdUpperLimit: 0,


    controllerSetup: function(){
        this.set("studentResultsSortable",
            SortableHelper.create({ sort: "user.fullName", direction:true }));
    }.on('init'),

    resetValues: function(){
        this.get('studentResultsSortable').set("direction", false);
        this.get('studentResultsSortable').set("sort", "user.fullName");
        this.set("selectedTermTaxonomy", null);
    },

    loadStudentResults: function(studentResults){
        var sortable = this.get("studentResultsSortable");
        sortable.set("data", studentResults);
    },

    /**
     * @properties to create show more details apllied ONLY in mobile
     */
    showDetails:function(idx,quizzesCompleted,masteryLevel){
        $('#mob-details').remove();

        var _quizzesComp;
        var _masteryLevel = numeral(masteryLevel).format('0.00');

        if(quizzesCompleted >= 0){
            _quizzesComp = quizzesCompleted;
        }else{
            quizzesCompleted = '-';
        }

        if( $('[data-arrow="'+idx+'"]').hasClass('glyphicon-chevron-up')){
            $('[data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('#mob-details').remove();
        }else{
            $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('[data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            var el = $('[data-pos="'+idx+'"]');
            el.after('<tr id="mob-details" class="visible-xs" ><td colspan="4"> <div>'+
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('hmcd.studentUsage.quizzesCompleted')+
                ':</span> <span class="mDesc">'+_quizzesComp+'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('hmcd.studentUsage.masteryLevel')+
                ':</span> <span class="mDesc">'+_masteryLevel+'</span> </div>' +
                '</div></td></tr>');
        }
    },

    /**
     * @property {string} label for the selected term taxonomy type
     */
    termTaxonomyLabel: Ember.computed("selectedTermTaxonomy", "product", function(){
        var product = this.get("class").get("product");
        var assignment = this.get("assignment");

        if (!assignment.get("hasTermTaxonomy")){ return; }

        var taxonomy = assignment.get("termTaxonomy");
        var key = TermTaxonomy.getParentType(product, taxonomy);
        var termTaxonomyAllowed = Product.termTaxonomyAllowedByKey(product, key);
        return termTaxonomyAllowed.label;
    }),

    actions: {
        onSortByCriteria: function(criteria){
            var controller = this;
            controller.sortByCriteria("studentResults", criteria);
        },
        showMore:function(idx,quizzesCompleted,masteryLevel){
            this.showDetails(idx,quizzesCompleted,masteryLevel);
        }
    }
});
