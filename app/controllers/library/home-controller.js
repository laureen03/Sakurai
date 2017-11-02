SakuraiWebapp.LibraryHomeController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin, {

    headerClasses: Ember.inject.controller(),
    library: Ember.inject.controller(),

    /**
     * @property {Class} selected class
     */
    class: Ember.computed.alias("library.class"),

    /**
     * @property {Section[]} list of sections
     */
    sections: Ember.computed.alias("library.sections"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    termTaxonomies: Ember.computed.alias("library.termTaxonomies"),

    /**
     * @property {questionSetsEnabled[]} list of question collections enabled
     */
    questionSetsEnabled: Ember.computed.alias("library.questionSetsEnabled"),

    /**
     * @property {groupedQuestionSets[]} list of question collections enabled
     */
    groupedQuestionSets: Ember.computed.alias("library.groupedQuestionSets"),

    /**
     * @property {number} total created question for this instructor
     */
    totalCreatedQuestions: Ember.computed.alias("library.totalCreatedQuestions"),

    /**
     * @property {Section[]} list of Classes
     */
    myClasses: Ember.computed.alias("library.myClasses"),

    /**
     * @property {user[]} list of Authors
     */
    authors: Ember.computed.alias("library.authors"),

    /**
     * @property to show chapter or Nursing Topics
     */
    filterChapterTitle: Ember.computed.alias("library.filterChapterTitle"),

    /**
     * Indicates if should display share QC option
     * @property {bool}
     */
    showShareQuestionCollection: Ember.computed.alias("library.showShareQuestionCollection"),

    /**
     * Indicates if should display filter by difficulty
     * @property {bool}
     */
    showFilterByDifficulty: Ember.computed.alias("library.showFilterByDifficulty"),

    /**
     * Difficulty range levels
     */
    difficultyRangeLevels: Ember.computed.alias("library.difficultyRangeLevels"),

    /**
     * @property {boolean} indicates when to activate the Search Library button
     */
    searchLibrarySelected: true,

    /**
     * @property {bool} indicates when to display the question set sub header,
     * this is only for s and xs resolutions
     */
    hideQuestionSetList: true,

    /**
     * Placeholder for search textfield
     **/
    placeholder: Ember.computed('searchByQuestionIdEnabled', function(){
        return (this.get("searchByQuestionIdEnabled")) ?
            I18n.t('questionLibrary.searchQuestionById') :
            I18n.t('questionLibrary.searchQuestions');
    }),

    /**
     * Value of search textfield
     **/
    term: "",

    /**
     * @property {string} question id
     */
    questionId: "",

    /**
     * @property {boolean} indicates if the search by question id is enabled
     */
    searchByQuestionIdEnabled: false,

    /**
     * @property {bool} is the modal to select question types visible?
     */
    isModalQuestionTypeSelectionVisible: false,

    selectedQuestionTypes: [],

    /**
     * @property {string} title to show in the modal window for term taxonomies
     */
    taxonomyModalTitle: Ember.computed.alias("library.taxonomyModalTitle"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    allTermTaxonomies: Ember.computed.alias("library.allTermTaxonomies"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies concepts
     */
    termTaxonomiesConcepts: Ember.computed.alias("library.termTaxonomiesConcepts"),

    /**
     * @property {defaultDataType string} select default data type for load screens
     */
    defaultDataType: Ember.computed.alias("library.defaultDataType"),

    /**
     * @property {questionStatusList string} List of question list
     */
    questionStatusList: Ember.computed.alias("library.questionStatusList"),

    /**
     * @property {product[]} List of other products by questions
     */
    otherProducts: Ember.computed.alias("library.otherProducts"),

    /**
    Return question type, its depends of the user role
    **/
    typeFilter: Ember.computed(function(){
        return (this.get("isAuthoringEnabled"))? SakuraiWebapp.ChapterFilter.HIDDEN_FILTER: SakuraiWebapp.ChapterFilter.QUIZ_FILTER;
    }),

    /**
     * @method {termTaxonomyList} draws a list of term taxonomy in the required format
     */
    termTaxonomyList: Ember.computed('allTermTaxonomies', 'termTaxonomiesConcepts', 'defaultDataType', function(){
        var controller = this;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var defaultTopic = controller.get('defaultDataType');
        var taxonomyTag = authenticationManager.get("taxonomyTag");
        var list = null;

        if (SakuraiWebapp.TermTaxonomy.isConcepts(defaultTopic) && (taxonomyTag)) //Check if the param Exist and if Concepts is the default
            list = controller.get("termTaxonomiesConcepts");
        else
            list = controller.get('allTermTaxonomies');

        return SakuraiWebapp.TermTaxonomy.convertToTree(list, defaultTopic);

    }),

    addToQueryString: function(queryParam, value) {
        var term = this.get("term"),
            queryStr = "?";

        queryStr += (term.trim() !== "") ? "term=" + term.trim() + "&" : "";
        queryStr += queryParam + "=" + value;

        return queryStr;
    },

    redirectToResults: function (queryString) {
        this.transitionToRoute("/instructor/library/results/" + this.get("class.id") + queryString);
    },

    /**
     * Indicates if the hide Chapter|Taxonomy feature is enabled
     * @property {bool}
     */
    hideFromPracticeQuizEnable: Ember.computed('isAuthoringEnabled', function(){
        return !this.get("isAuthoringEnabled");
    }),

    /**
     * @method Get ids of specific modal filter and go to search
     *
     * @param modalId
     * @param inputsName
     * @param paramName
     */
    searchWithFilter: function(modalId, inputsName, paramName){
        var queryParams, ids;
        ids = $("#"+ modalId + " input[name="+ inputsName +"]:checked").map(function () {
            return $(this).val()
        }).toArray();

        $('#'+modalId).modal('hide');

        ids = ids.join("-");
        queryParams = this.addToQueryString(paramName, ids);
        this.redirectToResults(queryParams);
    },

    actions: {
        searchByInstructor: function(){
            var authenticationManager = SakuraiWebapp.context.get("authenticationManager");
            var userId = authenticationManager.getCurrentUserId();
            var paramName = authenticationManager.getCurrentUser().get("isAdmin")? "authorIds" : "instructorId";

            this.redirectToResults("?"+paramName+"=" + userId);
        },

        /**
         * When searching using the input
         */
        onInputSearch: function () {
            var questionId = this.get("questionId");
            var term = this.get("term");
            if (this.get("searchByQuestionIdEnabled")){
                if (questionId.trim() !== "") {
                    this.redirectToResults("?questionId=" + questionId.trim());
                }
            }
            else{
                if (term.trim() !== "") {
                    this.redirectToResults("?term=" + term.trim());
                }
            }
        },

        searchByChapter: function (id) {
            var queryParams = this.addToQueryString('cid', id);
            queryParams = queryParams + '&currentPage=' + 1;
            this.redirectToResults(queryParams);
        },

        searchByTermTaxonomy: function (id) {
            var queryParams = this.addToQueryString('termTaxonomyIds', id);
            this.redirectToResults(queryParams);
        },

        searchByQuestionSet: function (id) {
            this.redirectToResults("?qsId=" + id);
        },

        /**
         * Shows the chapters for mobile
         */
        onShowSearchLibrary: function () {
            this.set("hideQuestionSetList", true);
            this.set("searchLibrarySelected", true);
        },

        /**
         * shows the question set for mobile
         */
        onShowQuestionSetList: function () {
            this.set("hideQuestionSetList", false);
            this.set("searchLibrarySelected", false);
        },

        removeTermFilter: function(){
            this.set("term", "");
        },

        removeQuestionIdFilter: function(){
            this.set("questionId", "");
        },

        /*--------------------------------
                Filter Functions
        --------------------------------*/
        showModalQuestionTypeFilter: function() {
            this.set('isModalQuestionTypeSelectionVisible', true);
        },

        filterByQuestionTypes: function (questionTypeArray) {
            var questionTypesStr, queryStr;

            questionTypesStr = questionTypeArray.join('-'),
            queryStr = this.addToQueryString("questionTypes", questionTypesStr);

            this.redirectToResults(queryStr);
        },

        filterByChapter: function () {
            this.searchWithFilter('chapter-mdl','chapters','cid');
        },

        filterByTermTaxonomy: function () {
            this.searchWithFilter('taxonomy-mdl','taxonomy','termTaxonomyIds');
        },

        filterByClassData: function () {
            this.searchWithFilter('class-data-mdl','class_data','classIds');
        },

        filterByAuthor: function () {
            this.searchWithFilter('author-mdl','author_checks','authorIds');
        },

        filterByQuestionStatus: function () {
            this.searchWithFilter('status-mdl','status_checks','questionStatus');
        },

        filterByProducts: function () {
            this.searchWithFilter('other-product-questions-mdl','product_checks','otherProductIds');
        },

        filterByDifficulty: function () {
            if ($("#difficulty-mdl input[name=difficulty]:checked").length > 0) {
                this.searchWithFilter('difficulty-mdl', 'difficulty', 'difficulty');
            } else {
                $('#difficulty-mdl').modal('hide');
            }
        },

        /**
         * Activates the search by term
         */
        activeKeyWord: function(){
            this.set("searchByQuestionIdEnabled", false);
            $(".question-library .search-filter").addClass("visible-desktop");
        },

        /**
         * Activates the search by question id
         */
        activeQuestionId: function(){
            $(".question-library .search-filter").addClass("visible-desktop");
            this.set("searchByQuestionIdEnabled", true);
        }
    }

});
