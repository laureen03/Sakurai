import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import Section from "models/section";

export default Controller.extend(
    ControllerMixin,
    FeatureMixin,{
    queryParams: ["categoryId", "subcategoryId", "chapterId"],
    headerClasses: Ember.inject.controller(),
    instructorManageAssignment: Ember.inject.controller(),
    manageAssignment: Ember.computed.alias('instructorManageAssignment'),
    init: function () {
        this._super();
        Ember.run.schedule("afterRender", this, function() {
            $('select').select2({
                minimumResultsForSearch: -1
            });
        });
    },


    /**
     * @property int Property associated to query parameter
     */
    chapterId: null,

    /**
     * @property int Property associated to query parameter
     */
    categoryId: null,

    /**
     * @property int Property associated to query parameter
     */
    subcategoryId: null,

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {Product} current product
     */
    product: null,

    /**
     * @property {Product} current product
     */
    termTaxonomyTypeOptions: null,

    /**
    * List of ML quizzes
    **/
    quizzesML: null,

    /**
     * List of categories for quiz filtering
     */
    categoryList: [],

    /**
     * List of categories for quiz filtering
     */
    categoryListIndex: {},

    /**
     * List of subcategories for quiz filtering
     */
    subcategoryList: [],
    entriesToSorting: ['order', 'childOrder'],
    sortedSubCategoryList: Ember.computed.sort('subcategoryList', 'entriesToSorting'),

    /**
     * List of chapters for quiz filtering
     */
    chapterList: [],
    sortedChapterList: Ember.computed.sort('chapterList', 'entriesToSorting'),

    /**
     * @property {JSON} indicate Current Page and Total Pages
     */
    filterData: {},

    /**
    * List of QC quizzes
    **/
    quizzesQC: null,

    /**
    * List of Review and Refresh quizzes
    **/
    quizzesRR: null,

    /**
     * @property {JSON} indicate Current Page and Total Pages
     */
    metadataML: {},

    /**
     * @property {JSON} indicate Current Page and Total Pages
     */
    metadataQC: {},

    /**
     * @property {JSON} indicate Current Page and Total Pages
     */
    metadataRR: {},

    /**
     * @property {num} indicate Student Id
     */
    studentId: null,

    /**
     * @property {num} Flag that let the controller know if it needs to rebuild the pagination
     */
    paginationFlag : false,

    /**
     * @property {num} Id of active chapter filter option
     */
    currentChapter: null,

    /**
     * @property {num} Id of active chapter filter option
     */
    currentCategory: null,

    /**
     * @property {num} Id of active subcategory filter option
     */
    currentSubcategory: null,

    isQuizHistory: true,

    /**
     * @property {bool} indicates if it has quizzes
     */
    hasQuizzes: Ember.computed("quizzesML", "quizzesQC", function(){
        return ((this.get("quizzesML") && (this.get("quizzesML").content.get("length") > 0)) || (this.get("quizzesQC") && (this.get("quizzesQC").content.get("length") > 0)) || (this.get("quizzesRR") && (this.get("quizzesRR").content.get("length") > 0)));
    }),

    /**
     * @property text Prompt
     */
    selectPrompt: Ember.computed(function(){
        return  I18n.t('quizHistory.allChapters');
    }),

    /**
     * @property text prompt for category drop-down
     */
    categoryPrompt: Ember.computed(function(){
        return  I18n.t('quizHistory.allCategories');
    }),

    /**
     * @property text prompt for category drop-down
     */
    subcategoryPrompt: Ember.computed(function(){
        return  I18n.t('quizHistory.allSubCategories');
    }),

    /**
     * @property boolean
     */
    isCategoryEnabled: Ember.computed('filterData', function(){
        return (this.get("categoryList")||[]).length > 1;
    }),

    /**
     * @property boolean
     */
    showAllQuizzesLink: Ember.computed("currentCategory", "currentSubcategory", "currentChapter", function(){
        if(this.getDefaultValue("currentChapter") === -1){ return false; }
        return this.getDefaultValue("currentChapter", false) || this.getDefaultValue("currentSubcategory", false);
    }),

    /**
     * @property {num} query string for filter values (&currentChapter=123 for instance)
     */
    filterQueryParameters: Ember.computed("categoryId", "subcategoryId", "chapterId", function(){
        //Build a query string that contains the current filter values, use them in the list link
        // to allow us to get them back when them click on the back to list link
        var filterQueryParameters = "";
        var valueProperties = ["categoryId", "subcategoryId", "chapterId"];
        for(var i=0; i < valueProperties.length; i++) {
            var value = this.getDefaultValue(valueProperties[i], null);
            if(value) {
                filterQueryParameters += "&"+valueProperties[i]+"="+value;
            }
        }
        return filterQueryParameters;
    }),

    /**
     * Handles the chapter filter change
     */
    handleChapterChange: Ember.observer('currentChapter', function() {
        var controller = this;
        var currentChapter = controller.get("currentChapter");
        this.set("chapterId", currentChapter ? currentChapter: null);
        var metadata = controller.get("metadataML");
        if(metadata.pagination) {
            metadata.pagination.currentPage = 1;
            metadata.pagination.totalResults = undefined;
        }
        controller.set("paginationFlag", true);
        controller.updateList("ML", metadata);
    }),

    /**
     * Handles the chapter filter change
     */
    handleSubcategoryChange: Ember.observer('currentSubcategory', function() {
        var controller = this;
        var currentSubcategory = controller.get("currentSubcategory");
        this.set("subcategoryId", currentSubcategory ? currentSubcategory: null);
        var metadata = controller.get("metadataML");
        if(metadata.pagination) {
            metadata.pagination.currentPage = 1;
            metadata.pagination.totalResults = undefined;
        }
        controller.set("paginationFlag", true);
        controller.updateList("ML", metadata);
    }),

    /**
     * Handles the chapter filter change
     */
    handleCategoryChange: Ember.observer('currentCategory', function() {
        var controller = this;
        var currentCategory = controller.get("currentCategory");
        var data = [];
        if(currentCategory) {
            data = controller.get("categoryListIndex")[currentCategory];
        }
        this.set("categoryId", currentCategory ? currentCategory: null);
        this.set("subcategoryId", null);
        controller.set("subcategoryList", data);
        this.set("currentSubcategory", undefined);
    }),

    /*
        Show Pagination
    */
    setPagination: function(type){
        var controller = this;
        if (controller.get("hasQuizzes") && controller.get("quizzes"+type))
        {
            var metadata = controller.get("metadata"+type);
            if(!metadata.pagination) {
                metadata.pagination = {
                    pageSize: 10
                };
            }
            var totalResults = metadata.pagination.totalResults ? metadata.pagination.totalResults : 0;
            var totalPages = Math.ceil(totalResults / metadata.pagination.pageSize);

            $('#pager-'+type).bootpag({
            total: totalPages,          // total pages
            page: metadata.pagination.currentPage,            // default page
            maxVisible: 5,     // visible pagination
            leaps: true         // next/prev leaps through maxVisible
            }).on("page", function(event, /* page number here */ num){
                 var metadata = controller.get("metadata"+type);
                 metadata.pagination.currentPage = num;
                 controller.updateList(type, metadata);
            });
        }
    },

    /*
        Update Metadata values
    */
    updateMetadata: function(metadata, metadataName){
        var _metadata = this.get(metadataName);

        _metadata.pagination = {};
        _metadata.criteria = {};
        _metadata.pagination.totalResults = metadata.pagination.totalResults;
        _metadata.pagination.currentPage = metadata.pagination.currentPage;
        _metadata.pagination.pageSize = metadata.pagination.pageSize;
        _metadata.pagination.sort = metadata.pagination.sort;
        _metadata.pagination.direction = metadata.pagination.direction;
        _metadata.criteria.type = metadata.criteria.type;
        _metadata.criteria.classId = metadata.criteria.classId;
        _metadata.criteria.studentId = metadata.criteria.studentId;

        this.set(metadataName, _metadata);
    },

    getDefaultValue: function (name, defaultValue) {
        var value = this.get(name);
        return value ? (value === "undefined" ? defaultValue : value) : defaultValue;
    },
    /*
        Update Quizzes list with another Criteria
    */
    updateList: function(type, metadata){
        var controller = this,
            store = controller.store;
        var chapterId = controller.getDefaultValue("currentChapter") !== -1 ? controller.getDefaultValue("currentChapter", null) : null,
            termId = controller.getDefaultValue("currentSubcategory", null);
        var filterId = chapterId ? chapterId : termId;
        //If category is NURSING_TOPICS the filter will go to 'chapterId' otherwise to 'termId'
        if( controller.get("categoryId") === Section.NURSING_TOPICS) {
            chapterId = filterId;
            termId = null;
        } else {
            chapterId = null;
            termId = filterId;
        }
        var params = {
                classId: controller.get("class.id"),
                studentId: controller.get("studentId"),
                type: metadata.criteria.type,
                currentPage: metadata.pagination.currentPage,
                pageSize: metadata.pagination.pageSize,
                sort: metadata.pagination.sort,
                direction: metadata.pagination.direction,
                totalResults: metadata.pagination.totalResults,
                chapterId: chapterId,
                termId: termId
            };

        store.query("quiz", params).then(function(quizzes){ //Update quiz list
            controller.set("quizzes"+type, quizzes);
            controller.updateMetadata(quizzes.get('meta'), "metadata"+type);
            if (controller.get("paginationFlag")) {
                controller.set("paginationFlag", false);
                controller.setPagination(type);
            }
        });
    },

    /*
        Update criteria with search params and refresh the list
    */
    sortByCriteria: function(sortableId, criteria){
        var controller = this;

        //it expects a table element having the class {sortableId}-table
        var tableElement = $("." + "quizzes" + sortableId + '-table');

        //it replaces any . in the criteria (i.e user.name) for _ (user_name)
        //it expects a column having a class .sort_{criteria}
        var criteriaSelector = ' .sort_' + criteria.replace(".", "_");

        var descending = $(criteriaSelector, tableElement).find('span').hasClass('headerSortUp');

        var direction = "";

        if(descending){
            $('.headerSortUp', tableElement).removeClass('headerSortUp');
            $(criteriaSelector, tableElement).find('span').addClass('headerSortDown');
            direction = "DESC";
        }else{
            $('.headerSortUp', tableElement).removeClass('headerSortUp');
            $('.headerSortDown', tableElement).removeClass('headerSortDown');
            $(criteriaSelector, tableElement).find('span').addClass('headerSortUp');
            direction = "ASC";
        }

        //UpdateMetadata and load new values
        var metadata = controller.get("metadata" + sortableId);
        metadata.pagination.direction = direction;
        metadata.pagination.sort = criteria;
        controller.updateList(sortableId, metadata);
    },

    actions: {
        viewResults: function(id, isReviewRefresh){
            var url = "";
            if (isReviewRefresh) {
                url = "/quiz/result/" + id + "/" + this.get("class.id") + "?quizHistory=true&isReviewRefresh=true";
            } else {
                url = "/quiz/result/" + id + "/" + this.get("class.id") + "?quizHistory=true";
            }
            url = url + this.get("filterQueryParameters");
            this.transitionToRoute(url);
        },

        goToQuiz: function(id, isReviewRefresh){

            if (isReviewRefresh) {
                this.transitionToRoute("/quiz/quizzer/" + id + "/" + this.get("class.id") + "?animation=false&isReviewRefresh=true"+this.get("filterQueryParameters"));
            } else {
                this.transitionToRoute("/quiz/quizzer/" + id + "/" + this.get("class.id") + "?animation=false"+this.get("filterQueryParameters"));
            }
        },

        onSortByCriteria: function(sortableId, criteria){
            this.sortByCriteria(sortableId, criteria);
        },

        allQuizzes: function() {
            if(this.get("isCategoryEnabled")) {
                $('.__category__').val("-1").trigger('change');
            } else {
                $('.__chapter__').val("-1").trigger('change');
            }
        }
    }
});
