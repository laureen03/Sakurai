//noinspection CommaExpressionJS

import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import QuestionPartialMixin from 'sakurai-webapp/mixins/question-partial';
import Question from 'sakurai-webapp/models/question';
import QuestionSet from 'sakurai-webapp/models/question-set';
import QuestionFilter from 'sakurai-webapp/models/question-filter';
import TermTaxonomy from 'sakurai-webapp/models/term-taxonomy';
import context from 'sakurai-webapp/utils/context';

export default Ember.Controller.extend(
    Ember.Evented,
    FeatureMixin,
    ControllerMixin,
    QuestionPartialMixin, {
    headerClasses: Ember.inject.controller(),
    library: Ember.inject.controller(),
    libraryCreateQuestionCollection: Ember.inject.controller(),
    admin: Ember.inject.controller(),

    createQuestionController: Ember.computed.alias('libraryCreateQuestionCollection'),
    queryParams: [
        'term', 'cid', 'qsId', 'preview',
        'termTaxonomyIds', 'instructorId', 'questionTypes',
        'classIds', 'authorIds', 'questionStatus',
        'classMisconception', 'direction', 'questionId', 'scrollTo', 'otherProductIds', 'currentPage', 'difficulty',
        'sortId', 'sort', 'direction'],

    /**
     * It filter the question for those having class misconception
     * @property {number}
     */
    classMisconception: null,

    /**
     * It indicates the sort direction
     * @property {string}
     */
    direction: null,

    /**
     * @property indicates search Term
     */
    term: "",

    /**
     * @property {string}
     */
    questionId: "",

    /**
     * @property {boolean} indicates if the search by question id is enabled
     */
    searchByQuestionIdEnabled: false,

    /**
     * @property indicates search by chapter Id
     */
    cid: "",

    /**
     * @property indicates search by question set id
     */
    qsId: "",

    /**
     *  @property {number} filtered by instructor id, created questions
     */
    instructorId: "",

    /**
     * @property {bool} show the preview modal?
     */
    preview: false,

    /**
     * @property indicates search by taxonomy Ids
     */
    termTaxonomyIds: "",

    /**
     * @property indicates search by question types
     */
    questionTypes: "",

    /**
     * @property indicates search by class ids
     */
    classIds: "",

    /**
     * @property indicates search by author ids
     */
    authorIds: "",

    /**
     * @property indicates search by other product ids
     */
    otherProductIds: "",

    /**
     * @property indicates search by question status
     */
    questionStatus: "",

    /**
     * @property indicates search by question difficulty
     */
    difficulty: "",

    /**
     * @property {Class} selected class
     */
    class: Ember.computed.alias("library.class"),

    /**
     * @property {Product} selected product
     */
    product: null,

    /**
     * @property {question} all questions from selected class
     */
    questions: null,

    /**
     * Alias of current instructor products from injected admin controller
     * This var is not defined for instructors
     * @property {Product[]} products
     */
    products : Ember.computed.alias("admin.products"),

    /**
     * @property {Section[]} list of sections
     */
    sections: Ember.computed.alias("library.sections"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    termTaxonomies: Ember.computed.alias("library.termTaxonomies"),

    /**
     * @property {QuestionSet[]} list of all question collections the instructor has for the current product
     */
    questionSets:  Ember.computed.alias("library.questionSets"),

    /**
     * @property {QuestionSetEnabled[]} list of question collections enabled the instructor has for the current product
     */
    questionSetsEnabled:  Ember.computed.alias("library.questionSetsEnabled"),

    /**
     * @property {groupedQuestionSets[]} list of question collections enabled
     */
    groupedQuestionSets: Ember.computed.alias("library.groupedQuestionSets"),

    /**
     * @property {number} total created question for this instructor
     */
    totalCreatedQuestions: Ember.computed.alias("library.totalCreatedQuestions"),

    /**
     * @property {number} number of question collections the instructor has for the current subject
     */
    questionSetsEnabledForCurrentSubject: Ember.computed.alias("library.questionSetsEnabledForCurrentSubject"),

    /**
     * @property {Section[]} list of Classes
     */
    myClasses: Ember.computed.alias("library.myClasses"),

    /**
     * @property {user[]} list of Authors
     */
    authors: Ember.computed.alias("library.authors"),

    /**
     * @property {questionStatusList string} List of question list
     */
    questionStatusList: Ember.computed.alias("library.questionStatusList"),

    /**
     * @property {product[]} List of other products by questions
     */
    otherProducts: Ember.computed.alias("library.otherProducts"),

    /**
     * @property {difficulty string} List of difficulties
     */
    difficultyRangeLevels: Ember.computed.alias("library.difficultyRangeLevels"),

    /**
     * @property to show chapter or Nursing Topics
     */
    filterChapterTitle: Ember.computed.alias("library.filterChapterTitle"),

    /**
     * @property {chapter} selected chapter
     */
    chapter: null,

    /**
     * Placeholder for search textfield
     **/
    placeholder: Ember.computed(function(){
        return (this.get("searchByQuestionIdEnabled")) ?
            I18n.t('questionLibrary.searchQuestionById') :
            I18n.t('questionLibrary.searchQuestions');
    }),

    instructor_filter: Ember.computed(function(){
        return QuestionFilter.INSTRUCTOR_FILTER;
    }),

        /**
     * {array} Sort options, it is initialized in the route
     */
    sortOptions: [],

    /**
     * @property {number} the sort id selected
     */
    sortId: 1, //default 1

    /**
     * @property {string} scroll to a specific question
     */
    scrollTo: null,

    /**
     * @property {mixed} contains the selected criteria used to get the results
     */
    criteria: {},

    /**
     * @property hold the page count
     */
    totalResults: null,

    /**
     * @property specified the page size
     */
    pageSize: 25,

    /**
     * @property currentPage
     */
    currentPage: 1,
    /**
     * @property {chapter} Selected chapter filters to show in the breadcrumb
     */
    filterSections: Ember.A(),

    /**
     * @property {termTaxonomy} Selected blooms taxonomy filters to show in the breadcrumb
     */
    filterTaxonomies: Ember.A(),

    /**
     * @property {questionType} Selected question type filters to show in the breadcrumb
     */
    filterQuestionTypes: Ember.A(),

    /**
     * @property {Class} Selected Class Ids filters to show in the breadcrumb
     */
    filterClassIds: Ember.A(),

    /**
     * @property {User} Selected Authors filters to show in the breadcrumb
     */
    filterAuthorIds: Ember.A(),

    /**
     * @property {Product} Selected other Products filters to show in the breadcrumb
     */
    filterOtherProductIds: Ember.A(),

    /**
     * @property {User} Selected Instructor filters to show in the breadcrumb
     */
    filterInstructorId: Ember.A(),

    /**
     * @property {questionStatus} Selected Question Status filters to show in the breadcrumb
     */
    filterQuestionStatus: Ember.A(),

    /**
     * @property {difficulty} Selected Question Difficulty filters to show in the breadcrumb
     */
    filterDifficulty: Ember.A(),

    /**
     * @property {QuestionSet} question set
     */
    questionSet: null,

    /**
     * @property {Boolean} active when is edit mode
     */
    questionSetEditMode: false,
    questionSetName: "",

    invalidQCName: false,

    /**
     * Define if the modal is a copy QC
     **/
    isCopyQC: false,

    /*List of orders*/
    orderList: Ember.A(),

    otherAnswersForTextEntry: Ember.ArrayProxy.create({ content: Ember.A([]) }),

    /**
     * @property {string} title to show in the modal window for term taxonomies
     */
    taxonomyModalTitle: Ember.computed.alias("library.taxonomyModalTitle"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    taxonomyModalType: Ember.computed.alias("library.taxonomyModalType"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    allTermTaxonomies: Ember.computed.alias("library.allTermTaxonomies"),

    /**
    * @property {number} Mouse X position
    **/
    mouseY: 0,

    /**
    * @property {strings} Control add to family functionality
    **/
    questionSelected: null,
    questionIdFamily: "",
    addFamilyNoteMessage: "",

    /**
    * @property {strings} Control add note functionality
    **/
    questionNoteDetail: "",

    /**
     * Products for the current subject
     * @property {Product[]}
     */
    subjectProducts: Ember.computed("products.[]", "product", function(){
        var subjectId = this.get("product.subject"),
            products = this.get("products") || Ember.A();
        return products.filterBy("subject", subjectId);
    }),

    onSortChanged: Ember.observer('sortId', function(){
        var sortId = this.get('sortId');
        if(typeof sortId === 'string'){
            this.doSearch();
        }
    }),

    onPreviewChange: Ember.observer('preview', function () {
        if (this.get('preview')) {
            this.trigger('preview.show');
        } else {
            this.trigger('preview.hide');
        }
    }),

    /**
     * @property {bool} indicates when to display the question set sub header,
     * this is only for s and xs resolutions
     */
    hideQuestionSetList: true,

    /**
     * @property {bool} indicates when to display the results
     */
    showResults: true,

    /**
     * Sets delete modal content
     */
    deleteColModalContent: I18n.t("questionLibrary.messages.deleteBody"),

    searchLibrarySelected: Ember.computed("questionSet", "hideQuestionSetList", function(){
        return this.get("questionSet") === null && this.get("hideQuestionSetList");
    }),

    hasQuestionSetsToImport: Ember.computed("questionSets", "questionSetsEnabledForCurrentSubject", function(){
        return this.get("questionSetsEnabledForCurrentSubject") > this.get("questionSets").get("length");
    }),

    isImportModalVisible: false,

    importModalQuestionSets: null,

    questionHistoryModal: Ember.Object.create({
        isVisible: false,
        data: null
    }),

    /**
     * @property {bool} is the modal to select question types visible?
     */
    isModalQuestionTypeSelectionVisible: false,

    selectedQuestionTypes: Ember.computed('criteria', function(){
        var criteria = this.get('criteria');

        // clone the array, if one exists
        return (criteria.questionTypes && $.isArray(criteria.questionTypes)) ? criteria.questionTypes.slice() : [];

    }),

    /**
     * Indicates if should display status filters
     * @property {bool}
     */
    showQuestionStatusFilters: Ember.computed("filterQuestionStatus.[]", "isAuthoringEnabled", function(){
        return this.get("isAuthoringEnabled") && this.get("filterQuestionStatus.length") > 0;
    }),

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
     * array to store co instructors selected
     * @property {Ember} array
     */
    customCoInstructors: Ember.A(),

    /**
     * array to store co instructors submitted
     * @property {Ember} array
     */
    submittedCoInstructors: Ember.A(),

    /**
     * array to store co instructors of class
     * @property {Ember} array
     */
    coInstructors: Ember.computed("class", function(){
        var currentUserId = context.get('authenticationManager').getCurrentUserId();
        var instructors = this.get("class").get("instructors");
        return instructors.removeObject(instructors.findBy("id", currentUserId)).sortBy("lastName");
    }),

    /**
     * array of co instructor ids which question set has been shared with
     * @property {Ember} array
     */
    sharedWithCoInstructors: Ember.computed("questionSet", {
        get: function() {
            var questionSet = this.get("questionSet");
            if (questionSet){
                return questionSet.get("sharedWith").mapBy("id");
            }
            else{
                return [];
            }
        },
        set: function(key, value) {
            return value;
        }
    }),

    shareQCBtnClass: Ember.computed("sharedWithCoInstructors", "coInstructors", function() {
        var btnClass = "btn btn-blue share-qc-button";
        if (this.get("sharedWithCoInstructors").length === this.get("coInstructors").length){
            btnClass += " disabled";
        }
        return btnClass;
    }),

    /*
        Init Controller
    */
    inititalize: function () {
        var controller = this;
        $(document).mousemove( function(e) {
            if (controller.isDestroyed || controller.isDestroying) {
                return;
            }
            controller.set("mouseY" , e.clientY);
        });
    }.on("init"),

    /**
    * Start new Search.
    **/
    doSearch: function(){
        var controller = this;
        var store = controller.store;
        store.query("question", controller.buildSearchParams(1)).then(function(questions){
            var metadata = questions.get('meta');
            controller.set("questions", questions);
            controller.updateMetadata(metadata);
        });
    },

    /**
     * Updates the controller with the metadata
     * @param metadata
     */
    updateMetadataQC: function(metadata){
        var controller = this;
        if (metadata.pagination.totalResults){
            controller.set('totalResults', metadata.pagination.totalResults);
        }
        controller.set('currentPage', parseInt(metadata.pagination.currentPage));
        controller.set('pageSize', metadata.pagination.pageSize);
    },

    initQuestionCollectionPagination: function(){
        var controller = this;
        var totalPages = Math.ceil(controller.get('totalResults') / controller.get('pageSize'));

        totalPages = (controller.get('totalResults') === 0)? 1 : totalPages;

        $(".qc-pagination").off(); //Remove all event listener
        //Init Pagination
        Ember.run.later((function() {
          $('.qc-pagination').bootpag({
            total: totalPages, // total pages
            page: controller.get('currentPage'),  // default page
            maxVisible: 10,  // visible pagination
            leaps: true      // next/prev leaps through maxVisible
            }).on("page", function(event, /* page number here */ num){
                controller.getPageQuestionCollectionResults(num);
            });
        }), 500);
    },

    /**
     * Updates the controller with the metadata
     * @param metadata
     */
    updateMetadata: function(metadata){
        var controller = this;
        if (metadata.pagination.totalResults){
            controller.set('totalResults', metadata.pagination.totalResults);
        }
        controller.set('currentPage', parseInt(metadata.pagination.currentPage));
        controller.set('criteria', metadata.criteria);

        //Show Chapter Filter
        if (metadata.criteria.sections){
            controller.loadChapterFilter(metadata.criteria.sections);
        }
        //Show Taxonomy Filter
        if (metadata.criteria.termTaxonomies){
            controller.loadTaxonomyFilters(metadata.criteria.termTaxonomies);
        }
        //Show Question
        if (metadata.criteria.questionTypes){
            controller.loadQuestionTypeFilters(metadata.criteria.questionTypes);
        }

        //Show Class Data
        if (metadata.criteria.classes){
            controller.loadClassDataFilters(metadata.criteria.classes);
        }

        //Show Author
        if (metadata.criteria.authors){
            controller.loadAuthorsFilters(metadata.criteria.authors);
        }

        //Show Other Product
        if (metadata.criteria.otherProducts){
            controller.loadOtherProductsFilters(metadata.criteria.otherProducts);
        }
        //Show Instructor
        if ((metadata.criteria.instructors) && (metadata.criteria.instructors.length !== 0)){
            controller.loadInstructorsFilters(metadata.criteria.instructors);
        }

        //Show Question Status
        if (metadata.criteria.questionStatus){
            controller.loadQuestionStatusFilters(metadata.criteria.questionStatus);
        }
        //Show Question Difficulty
        if (metadata.criteria.difficulty){
            controller.loadDifficultyFilters(metadata.criteria.difficulty);
        }
    },

    /**
     * Builds the search parameters for question collection questions
     * @param page
     * @returns {Object}
     */

    buildQCParameter:function(page){
        var controller = this,
            queryObj = {
                "questionSetId": controller.get("questionSet.id"),
                "currentPage" : page,
                "pageSize": controller.get("pageSize")
            };

        return queryObj;
    },

    /**
     * Builds the search parameters
     * @param page
     * @returns {Object}
     */
    buildSearchParams: function(page){
        var controller = this,
            product = controller.get("product"),
            criteria = controller.get("criteria"),
            sortId = controller.get("sortId"),
            sortOption = controller.getSortOption(sortId),
            termExist = ((criteria.term) && (criteria.term.trim().length > 0)),
            questionSetIdExist = ((criteria.questionSetId) && (criteria.questionSetId.trim().length > 0)),
            classMisconception = controller.get("classMisconception"),
            instructorIdExist = (criteria.instructors),

            queryObj = {
                "productId" : product.get("id"),
                "sectionIds": criteria.sections,
                "sort" : sortOption.sort,
                "direction" : sortOption.direction || controller.get("direction"),
                "currentPage" : page,
                "questionSetId":((questionSetIdExist) ? criteria.questionSetId: undefined),
                "term": ((termExist)? criteria.term: undefined),
                "ids": criteria.questions,
                "termTaxonomyIds": criteria.termTaxonomies,
                "questionTypes": criteria.questionTypes,
                "classIds": criteria.classes,
                "authorIds": criteria.authors,
                "instructorId": ((instructorIdExist) ? criteria.instructors[0]: undefined),
                "questionStatus": criteria.questionStatus,
                "isQuestionLibrary": 1,
                "otherProductIds" : criteria.otherProducts,
                "difficulty": criteria.difficulty
            };
            //if (instructorId) { queryObj.instructorId = instructorId; }
            if (classMisconception) { queryObj.classMisconception = classMisconception; }
            if (sortOption) {
                controller.set("sort", sortOption.sort);
                controller.set("direction", sortOption.direction);
            }
        return queryObj;
    },

    /**
     * Returns the sort option by id
     * @param id
     */
    getSortOption: function(id){
        var options = this.get("sortOptions");
        var option = null;
        $.each(options, function(i, opt){
            if (opt.id === id){
                option = opt;
                return false;
            }
        });
        return option;
    },

    /**
    * Create a list of index available to order the questions.
    **/
    setOrderList: function(){
        var orderList = this.get("orderList"),
            controller = this;

        orderList.clear();
        for (var i = 1; i <= controller.get("totalResults"); i++) {
            orderList.pushObject(i);
        }
        controller.setOrderQuestionList();
    },

    /**
    *  Delete last item in the orderList
    */
    decreaseOrderList: function(){
        var controller = this,
            orderList = this.get("orderList");
        controller.set("orderList", orderList.removeAt(orderList.length-1));
    },

    /**
    *  Set the order to the question depends of the current Page
    **/
    setOrderQuestionList:function(){
        var controller = this,
            initIndex = 1,
            endIndex = 0,
            questionIndex = 0;

        initIndex = (controller.get("currentPage")-1) * controller.get("pageSize");
        endIndex = controller.get("currentPage") * controller.get("pageSize");
        endIndex = (controller.get("totalResults")< endIndex) ? controller.get("totalResults") : endIndex;

        for (var i = initIndex; i < endIndex; i++) {
            var question = controller.get("questions").nextObject(questionIndex);
            questionIndex = questionIndex + 1;
            question.set("order", i + 1);
        }
    },

    /**
    *  Get QC results by page
    *  @page
    **/
    getPageQuestionCollectionResults: function(page){
        var controller = this;
        var store = controller.store;
        $("html, body").animate({ scrollTop: 0 }, "slow");
        context.set("isLoading", true);
        if (controller.get("questionSet")) {
            var result = store.query("questionSet", controller.buildQCParameter(page));
            result.then(function(questionSet){
                var metadata = questionSet.get('meta');
                controller.updateMetadataQC(metadata);
                var questions = questionSet.get('firstObject').get("questions");
                questions.then(function(data_questions){
                    controller.set("questions", data_questions);
                    controller.setOrderQuestionList();
                    context.set("isLoading", false);
                });
            });
        }
    },

    /**
    *  Get next 25 Question (search by filters results)
    *  @Param data
    **/
    getPageResults: function(data){
        var controller = this,
        store = controller.store,
        metadata = store._metadataFor("question");

        var page = controller.get('currentPage');
        if (metadata.pagination) {
            page = (metadata.pagination.currentPage > 1) ? parseInt(metadata.pagination.currentPage) : metadata.pagination.pageSize / 25;
        }

        var result = store.query("question", controller.buildSearchParams(page + 1));
        result.then(function(questions){
            var metadata = questions.get('meta');
            controller.updateMetadata(metadata);
            controller.get('questions').pushObjects(questions.content);
            controller.trigger('asyncLink.restore', data.component);
        });
    },

    /**
     * Load filters by chapter into the breadcrumb
     * @param sections
     */
    loadChapterFilter: function(sections){
        var controller = this;
        var store = controller.store;
        controller.get("filterSections").removeObjects(controller.get("filterSections"));
        controller.set("cid", sections.join('-'));
        $.each(sections, function( index, value ) {
            store.find("section", value).then(function(data){
                controller.get("filterSections").pushObject(data);
            });
        });
    },

    /**
     * Load filters by taxonomy into the breadcrumb
     * @param termTaxonomies
     */
    loadTaxonomyFilters: function(termTaxonomies){
        var controller = this;
        var store = controller.store;

        controller.get("filterTaxonomies").clear();

        controller.set("termTaxonomyIds", termTaxonomies.join('-'));
        $.each(termTaxonomies, function( index, value ) {
            store.find("termTaxonomy", value).then(function(termTaxonomy){
                controller.get("filterTaxonomies").pushObject(termTaxonomy);
            });
        });
    },

    /**
     * Load filters by question types into the breadcrumb
     * @param questionTypes
     */
    loadQuestionTypeFilters: function(questionTypes){
        var self = this,
            i18nQuestionTypeNames = self.sakuraiConfig.get('questionTypesMap');

        this.get("filterQuestionTypes").clear();

        this.set("questionTypes", questionTypes.join('-'));

        $.each(questionTypes, function( index, questionType ) {

            self.get("filterQuestionTypes").pushObject({
                code: questionType,
                name: i18nQuestionTypeNames[questionType]
            });
        });
    },

    /**
     * Load filters by Class Ids into the breadcrumb
     * @param classIds
     */
    loadClassDataFilters: function(classIds){
        var controller = this,
            store = controller.store;

        controller.get("filterClassIds").removeObjects(controller.get("filterClassIds"));
        controller.set("classIds", classIds.join('-'));
        $.each(classIds, function( index, value ) {
            store.find("class", value).then(function(data){
                controller.get("filterClassIds").pushObject(data);
            });
        });
    },

     /**
     * Load filters by Authors into the breadcrumb
     * @param authorIds
     */
    loadAuthorsFilters: function(authorIds){
        var controller = this,
            store = controller.store;

        controller.get("filterAuthorIds").removeObjects(controller.get("filterAuthorIds"));
        controller.set("authorIds", authorIds.join('-'));
        $.each(authorIds, function( index, value ) {
            store.find("user", value).then(function(data){
                controller.get("filterAuthorIds").pushObject(data);
            });
        });
    },

    /**
     * Load filters by Other Products into the breadcrumb
     * @param otherProductIds
     */
    loadOtherProductsFilters: function(otherProductIds){
        var controller = this,
            store = controller.store;

        controller.get("filterOtherProductIds").removeObjects(controller.get("filterOtherProductIds"));
        controller.set("otherProductIds", otherProductIds.join('-'));
        $.each(otherProductIds, function( index, value ) {
            store.find("product", value).then(function(data){
                controller.get("filterOtherProductIds").pushObject(data);
            });
        });
    },

    /**
     * Load filters by Instructor into the breadcrumb
     * @param instructorId
     */
    loadInstructorsFilters: function(instructorId){
        var controller = this,
            store = controller.store;

        if (instructorId.length!==0){
            controller.get("filterInstructorId").removeObjects(controller.get("filterInstructorId"));
            controller.set("instructorId", instructorId[0]);
            store.find("user", instructorId).then(function(data){
                controller.get("filterInstructorId").pushObject(data);
            });
        }
    },

    /**
     * Load filters by Question Status into the breadcrumb
     * @param questionStatus
     */
    loadQuestionStatusFilters: function(questionStatus){
        var controller = this; 

        controller.get("filterQuestionStatus").removeObjects(controller.get("filterQuestionStatus"));
        controller.set("questionStatus", questionStatus.join('-'));
        $.each(questionStatus, function( index, questionType ) {
            controller.get("filterQuestionStatus").pushObject({
                code: questionType,
                name: questionType
            });
        });
    },

    /**
     * Load filters by Question difficulty into the breadcrumb
     * @param difficulty
     */
    loadDifficultyFilters: function(difficulty){
        var controller = this;

        controller.get("filterDifficulty").removeObjects(controller.get("filterDifficulty"));
        controller.set("difficulty", difficulty.join('-'));
        $.each(difficulty, function( index, item ) {
            controller.get("filterDifficulty").pushObject({
                code: item,
                name: item.replace("|", " - ")
            });
        });
    },


    /**
     * @property Manage the show more option
     */
     showPaging: Ember.computed("currentPage", "pageSize", "totalResults", function(){
        var currentPage  = this.get('currentPage');
        var pageSize     = this.get('pageSize');
        var totalResults = this.get('totalResults');
        var totalPages   = Math.ceil(totalResults / pageSize);

        if(currentPage >= totalPages){
            return false;
        }

        return true;
    }),

    /**
     * @function remove question from Question collection
     */
    removeQuestion: function(question){
        var controller = this;
        var questionSetId = controller.get("questionSet.id");
        QuestionSet.removeQuestionFromQC(questionSetId, question.get('id')).then(function(){
            controller.getPageQuestionCollectionResults(controller.get('currentPage'));
            controller.decreaseOrderList();
        });
    },

    /**
     * @function Add new question to questionSet
     */
     addQuestion: function(question, questionSet){
        var controller = this;
        var successMessage = I18n.t('questionLibrary.messages.success') + ' ' + questionSet.get("name");
        var errorMessage = I18n.t('questionLibrary.messages.error') + ' ' + questionSet.get("name");
        QuestionSet.fetch(questionSet).then(function(data){
            var existing = data.get("questions").findBy('id', question.get('id'));
            if(existing === undefined) {
                QuestionSet.addQuestionToQC(questionSet.get('id'), question.get('id'), questionSet.get('totalQuestions')).then(function(){
                    questionSet.set("totalQuestions", questionSet.get("totalQuestions")+1); //Inc the total Question
                    toastr.success(successMessage); //Show success message
                    if (controller.get("isInFrame")){
                        $('.toast-top-full-width').css("top", (controller.get("mouseY") - 50) + "px");
                    }
                });
            } else {
                toastr.error(errorMessage);
                if (controller.get("isInFrame")){
                    $('.toast-top-full-width').css("top", (controller.get("mouseY") - 50) + "px");
                }
            }
        });
    },

    /**
     * @function Edit name of question collection
     */
    editNameQC:function() {
        var controller = this;
        if ($("#edit-qc").valid()) {
            var questionSet = controller.get("questionSet");
            var name = controller.get("questionSetName");
            var currentName = questionSet.get("name");

            if(name.toLowerCase().trim() === currentName.toLowerCase().trim() || (name!== currentName && this.isQCNameValid(name))) {
                questionSet.set("mode", "info");
                questionSet.set("name", name);
                questionSet.save().then(function(questionSet){
                    controller.set("questionSetEditMode", false);
                    var initIndex = 1,
                        endIndex = 0;

                    var questionList = questionSet.get("questions");


                    initIndex = (controller.get("currentPage")-1) * controller.get("pageSize");
                    endIndex = controller.get("currentPage") * controller.get("pageSize");
                    endIndex = (controller.get("totalResults")< endIndex) ? controller.get("totalResults") : endIndex;

                    controller.set("questions", questionList.slice(initIndex, endIndex));
                });
            }
        }
    },

    isQCNameValid: function(name) {
        var controller = this;
        var questionSetList = controller.get('library').get('questionSets');
        for (var i = 0; i < questionSetList.content.length; i++) {
            var qcName = questionSetList.content[i]._data.name;
            if (name.toLowerCase().trim() === qcName.toLowerCase().trim() && questionSetList.nextObject(i).get("parentOwner").get("id") === undefined) {
                controller.set("invalidQCName", true);
                return false;
            }
        }
        return true;
    },

    resetValues: function(){
        var controller = this;
        controller.set("term", "");
        controller.set("questionId", "");
        controller.set("cid", "");
        controller.set("termTaxonomyIds", "");
        controller.set("questionTypes", "");
        controller.set("classIds", "");
        controller.set("authorIds", "");
        controller.set("otherProductIds", "");
        controller.set("instructorId","");
        controller.set("questionStatus", "");
        controller.set("difficulty", "");
        controller.set("showResults", true);
        controller.set("hideQuestionSetList", true);
        controller.set("questionSet", null);
        controller.set("classMisconception", null);

        if (controller.get("scrollTo") === null){
            controller.set("sortId", 1);
        }

        controller.get("filterSections").clear();
        controller.get("filterTaxonomies").clear();
        controller.get("filterQuestionTypes").clear();
        controller.get("filterClassIds").clear();
        controller.get("filterAuthorIds").clear();
        controller.get("filterOtherProductIds").clear();
        controller.get("filterInstructorId").clear();
        controller.get("filterDifficulty").clear();
        controller.get("customCoInstructors").clear();
        controller.get("submittedCoInstructors").clear();
    },

    /**************** Properties for deleting QC ****************/

    /**
     * Sets delete modal title
     */
    deleteColModalTitle: Ember.computed('questionSet.name', function(){
        var questions = this.get('questionSet');
        return (questions !== null )? I18n.t("questionLibrary.messages.deleteHeader") + " '" + questions.get("name")  + "'?" : "";

    }),


    /**
     * Sets delete modal content
     */
    removeQuestionCollection: function(){
        var controller = this;
        var questionSet = controller.get("questionSet");
        var errorMessage =  questionSet.get("name") + ' deleted';
        questionSet.set("mode", "info");
        questionSet.set('enabled',false);
        questionSet.save().then(function(){
            $('#delete-modal').modal('hide');
            toastr.error(errorMessage,function(){
                controller.transitionToRoute("/instructor/library/home/" + controller.get("class").get("id"));
                if (controller.get("isInFrame")){
                    $('.toast-top-full-width').css("top", (controller.get("mouseY")-50) + "px");
                }
            });
        });
    },

    isFilterEmpty:function(){
        var criteria = this.get("criteria");
        return (!((criteria.term) && (criteria.term.trim().length > 0)) &&
                !((criteria.questions) && (criteria.questions.length > 0)) &&
                !((criteria.sections) && (criteria.sections.length > 0)) &&
                !((criteria.termTaxonomies) && (criteria.termTaxonomies.length > 0)) &&
                !((criteria.questionTypes) && (criteria.questionTypes.length > 0)) &&
                !((criteria.classes) && (criteria.classes.length > 0)) &&
                !((criteria.authors) && (criteria.authors.length > 0)) &&
                !((criteria.otherProducts) && (criteria.otherProducts.length > 0)) &&
                !((criteria.instructors) && (criteria.instructors.length > 0)) &&
                !((this.get("showQuestionStatusFilters")) && (criteria.questionStatus) && (criteria.questionStatus.length > 0)) &&
                !((criteria.difficulty) && (criteria.difficulty.length > 0)));

    },

    /**
     * @method Checks if there is 1 or more question in
     * the question set
     */
     hasQuestions: Ember.computed('questionSet.totalQuestions', function(){
        var questionSet =  this.get('questionSet');
        if (!questionSet){
            return false;
        }
        var totalQuestions = questionSet.get('totalQuestions');
        return totalQuestions>0;
    }),

    /**
     * Decreases the total results
     */
    decreaseTotalResults: function(){
        var controller = this;
        controller.set("totalResults", (controller.get("totalResults") - 1));
    },
    /**
     * Increases the total results
     */
    increaseTotalResults: function(){
        var controller = this;
        controller.set("totalResults", (controller.get("totalResults") + 1));
    },
    /**
     * Indicates if "assign question set assignment" feature is enabled
     * @property {bool}
     */
    assignQuestionSetAssignmentEnabled: Ember.computed('isAuthoringEnabled', function(){
        return !this.get("isAuthoringEnabled");
    }),

    /**
     * Indicates the results are shown for a class
     * @see QuestionPartialMixin
     * @property {bool}
     */
    classView: Ember.computed.bool("classIds.length"),

    restoreVariantTab: function($variant) {
        $variant
            .removeClass('loading')
            .toggleClass('open')
            .find('a')
                .removeAttr('disabled')
                .removeClass('disabled');
    },

    changeQuestionStatus: function(question, status){
        var controller = this, currentUserId;
        var store = controller.store;
        var promise = Question.changeQuestionStatus(store, question, status);
        var questions = this.get("questions");
        promise.then(function(changed){
            if (changed){
                if(status === Question.ACTIVE && question.get("difficulty") === null) {
                    status = Question.CALIBRATING;
                }
                question.set("status", status);
                if (question.get("retired")){
                    if (controller.qsId==="") {
                        questions.removeObject(question);
                        controller.decreaseTotalResults();
                    }
                    currentUserId = context.get('authenticationManager').getCurrentUserId();
                    if (question.get("instructor")) {
                        question.get("instructor").then(function(owner){
                            if (owner && owner.get("id")===currentUserId){
                                controller.get("library").decTotalCreatedQuestions();
                            }
                        });
                    }
                    if (question.get("author")) {
                        question.get("author").then(function(owner){
                            if (owner && owner.get("id")===currentUserId){
                                controller.get("library").decTotalCreatedQuestions();
                            }
                        });
                    }
                } else if (question.get("active") || question.get("onHold")){
                    if (controller.qsId==="") {
                        questions.addObject(question);
                        controller.increaseTotalResults();
                    }
                    currentUserId = context.get('authenticationManager').getCurrentUserId();
                    if (question.get("instructor")) {
                        question.get("instructor").then(function(owner){
                            if (owner && owner.get("id")===currentUserId){
                                controller.get("library").incTotalCreatedQuestions();
                            }
                        });
                    }
                    if (question.get("author")) {
                        question.get("author").then(function(owner){
                            if (owner && owner.get("id")===currentUserId){
                                controller.get("library").incTotalCreatedQuestions();
                            }
                        });
                    }
                }
            }
            else{
                Ember.Logger.warn("Can't change question status");
            }
        });
    },

    actions:{
        activeQCEdit: function(){
            this.set("questionSetEditMode", true);
            this.set("questionSetName", this.get("questionSet").get("name"));
        },

        editQL: function(){
            this.editNameQC();
        },

        resetQCError: function() {
            this.set('invalidQCName', false);
        },

        showMore: function(data){
            this.getPageResults(data);
        },

        searchByInstructor: function(){
            var authenticationManager = context.get("authenticationManager");
            var userId = authenticationManager.getCurrentUserId();
            var paramName = authenticationManager.getCurrentUser().get("isAdmin")? "authorIds" : "instructorId";
            this.transitionToRoute("/instructor/library/results/" + this.get("class").get("id") + "?"+paramName+"=" + userId);
        },

        /**
         * When searching using the input
         */
        onInputSearch: function () {
            var controller = this;
            if(controller.get('term')) {
                controller.get("criteria").term = controller.get('term');
            }
            if(controller.get('questionId')) {
                controller.get("criteria").questions = [controller.get('questionId')];
            }

            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ controller.get("class").get("id"));
            }else{
                controller.doSearch();
            }

            //Reset css Style
            $(".question-library .search-filter").removeClass("visible-desktop");
        },

        filterByChapter: function(){
            var ids = $(".question-library .units-chapter input[name=chapters]:checked").map(function () {
                return $(this).val();
            }).toArray();
            this.get("criteria").sections = ids;
            this.doSearch();
            $('#chapter-mdl').modal('hide');
        },

        filterByClassData: function(){
            var ids = $(".question-library .class-data input[name=class_data]:checked").map(function () {
                return $(this).val();
            }).toArray();
            this.get("criteria").classes = ids;
            this.doSearch();
            $('#class-data-mdl').modal('hide');
        },

        filterByDifficulty: function () {
            if ($("#difficulty-mdl input[name=difficulty]:checked").length > 0) {
                var ids = $(".question-library .difficulty input[name=difficulty]:checked").map(function () {
                    return $(this).val();
                }).toArray();
                this.get("criteria").difficulty = ids;
                this.doSearch();
            }
            $('#difficulty-mdl').modal('hide');
        },

        filterByAuthor: function(){
            var ids = $(".question-library .authors-content input[name=author_checks]:checked").map(function () {
                return $(this).val();
            }).toArray();
            this.get("criteria").authors = ids;
            this.doSearch();
            $('#author-mdl').modal('hide');
        },

        filterByQuestionStatus: function () {
             var ids = $("#status-mdl input[name=status_checks]:checked").map(function () {
                return $(this).val();
            }).toArray();

            this.get("criteria").questionStatus = ids;
            this.doSearch();
            $('#status-mdl').modal('hide');
        },

        filterByTermTaxonomy: function(type){
            //current taxonomy ids selected by type
            var ids = $(".question-library .units-chapter input[name=taxonomy]:checked").map(function () {
                    return $(this).val();
                }).toArray();

            var filterTaxonomies = this.get('filterTaxonomies');

            //previously taxonomies selected by type, so they are not included anymore, ids has the new version
            var taxonomiesByType = TermTaxonomy.filterByType(filterTaxonomies, type);
            var taxonomyByTypeIds = taxonomiesByType.map(function(taxonomy){
                return taxonomy.get("id");
            }).toArray();

            //adding only non type ids selected previously
            filterTaxonomies.forEach( function(taxonomy) {
                var taxonomyId = taxonomy.get('id');
                var notInType = $.inArray(taxonomyId, taxonomyByTypeIds) < 0;
                if (notInType){ //only ids not related to this type
                    ids.push(taxonomyId);
                }
            });

            this.get("criteria").termTaxonomies = ids;

            this.doSearch();
            $('#taxonomy-mdl').modal('hide');
        },

        filterByQuestionTypes: function(questionTypeArray) {
            if (questionTypeArray && questionTypeArray.length) {
                this.get("criteria").questionTypes = questionTypeArray;
                this.doSearch();
            } else {
                // If no question types were selected, that's the same as removing the
                // filter altogether
                this.send('removeQuestionTypeFilter');
            }
        },

        filterByProducts: function () {
            var ids = $("#other-product-questions-mdl input[name=product_checks]:checked").map(function () {
                return $(this).val();
            }).toArray();
            this.get("criteria").otherProducts = ids;
            this.doSearch();
            $('#other-product-questions-mdl').modal('hide');
        },

        filterByOtherProduct: function(productId, currentProductId) {
            if (productId !== currentProductId) {
                this.get('criteria').otherProducts = [productId];
                this.doSearch();
            }
        },

        /*
        * Remove Chapters ilters
        */
        removeChapterFilter: function(){
            var controller = this;
            //remove from ui
            controller.get("filterSections").removeObjects(controller.get("filterSections"));
            //unselect chexkbox
            $('.question-library #chapter-mdl input[type=checkbox]').prop('checked', false);
            //remove from paramether
            controller.get("criteria").sections = [];
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }

        },

        /*
        * Remove Class Id filters
        */
        removeClassIdsFilter: function(){
            var controller = this;
            //remove from ui
            controller.get("filterClassIds").removeObjects(controller.get("filterClassIds"));
            //unselect chexkbox
            $('.question-library #class-data-mdl input[type=radio]').prop('checked', false);
            //remove from paramether
            controller.get("criteria").classes = [];
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },

        /*
        * Remove Author filters
        */
        removeAuthorsFilter: function(){
            var controller = this;
            //remove from ui
            controller.get("filterAuthorIds").removeObjects(controller.get("filterAuthorIds"));
            //unselect chexkbox
            $('.question-library #author-mdl input[type=chexkbox]').prop('checked', false);
            //remove from paramether
            controller.get("criteria").authors = [];
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },

       /*
        * Remove Other Product filters
        */
        removeOtherProductsFilter: function(){
            var controller = this;
            //remove from ui
            controller.get("filterOtherProductIds").removeObjects(controller.get("filterOtherProductIds"));
            //unselect chexkbox
            $('.question-library #other-product-questions-mdl input[type=checkbox]').prop('checked', false);
            //remove from paramether
            controller.get("criteria").otherProducts = [];
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },

        /*
        * Remove Instructor filters
        */
        removeInstructorFilter: function(){
            var controller = this;
            //remove from ui
            controller.get("filterInstructorId").removeObjects(controller.get("filterInstructorId"));

            //remove from paramether
            controller.get("criteria").instructors = "";
            controller.set("instructorId", "");

            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },



        /*
        * Remove Question Status filters
        */
        removeQuestionStatusFilter: function(){
            var controller = this;
            //remove from ui
            controller.get("filterQuestionStatus").removeObjects(controller.get("filterQuestionStatus"));
            //unselect chexkbox
            $('.question-library #status-mdl input[type=chexkbox]').prop('checked', false);
            //remove from paramether
            controller.get("criteria").questionStatus = [];
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },

        /*
        * Remove Taxonomiens filters
        */
        removeTaxonomyFilter: function(type){
            var controller = this;

            var filterTaxonomies = controller.get("filterTaxonomies");
            var taxonomiesByType = TermTaxonomy.filterByType(filterTaxonomies, type);

            //remove from filters
            filterTaxonomies.removeObjects(taxonomiesByType);

            // update criteria
            var criteria = controller.get("criteria");
            criteria.termTaxonomies = filterTaxonomies.map( function(termTaxonomy) {
                return termTaxonomy.get('id');
            }).toArray();

            if (controller.isFilterEmpty()) {
                controller.transitionToRoute("/instructor/library/home/" + this.get("class").get("id"));
            } else {
                controller.doSearch();
            }
        },

        /*
        * Remove Question Type filters
        */
        removeQuestionTypeFilter: function() {
            this.get("filterQuestionTypes").clear();
            this.get("criteria").questionTypes = [];

            if (this.isFilterEmpty()) {
                this.transitionToRoute("/instructor/library/home/" + this.get("class.id"));
            } else {
                this.doSearch();
            }
        },

        /*
        * Remove Term filters
        */
        removeTermFilter: function(){
            var controller = this;

            controller.set("term", "");
            controller.set("criteria.term", "");
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },

        /**
        * Remove question id filters
        */
        removeQuestionIdFilter: function(){
            var controller = this;
            controller.set("questionId", "");
            delete controller.get("criteria").questions;
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },

        /*
        * Remove Question Difficulty filters
        */
        removeDifficultyFilter: function(){
            var controller = this;
            //remove from ui
            controller.get("filterDifficulty").removeObjects(controller.get("filterDifficulty"));
            //unselect chexkbox
            $('.question-library #difficulty-mdl input[type=chexkbox]').prop('checked', false);
            //remove from paramether
            controller.get("criteria").difficulty = [];
            if (controller.isFilterEmpty()){
                controller.transitionToRoute("/instructor/library/home/"+ this.get("class").get("id"));
            }else{
                controller.doSearch();
            }
        },

        searchByQuestionSet: function(id){
            var classId = this.get("class").get("id");
            this.transitionToRoute("/instructor/library/results/" + classId + "?qsId=" + id);
        },

        onRemoveQuestion: function(question){
            $("#remove-link-"+question.get("id")).html("<span class='glyphicon glyphicon-refresh animate-spin'></span>");
            $("#remove-link-"+question.get("id")).addClass("disabled");
            this.removeQuestion(question);
        },

        onEditQuestion: function(question){
            var controller = this,
                classId = controller.get("class").get("id");
            controller.set("scrollTo", question.get("id"));
            Ember.run.later(function(){
                controller.transitionToRoute("/instructor/library/createQuestion/" + classId + "/" + question.get("id"));
            }, 100);
        },

        /* Add To Family */
        onAddToFamily: function(question){
            this.set("questionIdFamily", "");
            this.set("addFamilyNoteMessage", "");
            $('#add_to_family_modal .error').css("display", "none");
            $('#add_to_family_modal').modal("show");
            this.set("questionSelected", question);
        },

        onAddQuestionToFamily: function(){
            var controller = this,
                store = controller.store,
                questionSelected = controller.get("questionSelected"),
                questionIdFamily = controller.get("questionIdFamily");
            if (questionIdFamily.trim()!==""){
                var promise = Question.updateFamily(store, questionSelected.get("id"), questionIdFamily);
                promise.then(function(question){
                    if (question){
                        controller.set("questionSelected.parentId", question.parentId);
                        controller.set("questionSelected.hasVariant", question.hasVariant);

                        //Case 3
                        if (question.parentId === controller.get("questionIdFamily")){
                            var questionVariant =  controller.get("questions").findBy("id", controller.get("questionIdFamily"));
                            questionVariant.set("hasVariant", true);
                        }

                        var successMessage = I18n.t("questionLibrary.addToFamily.question") + question.id + " " + I18n.t("questionLibrary.addToFamily.andQuestion") + controller.get("questionIdFamily") + " " + I18n.t("questionLibrary.addToFamily.andQuestion") + question.parentId;

                        controller.set("addFamilyNoteMessage", successMessage);
                    }
                }, function() {
                    controller.set("addFamilyNoteMessage", I18n.t("questionLibrary.addToFamily.errorAddFamily"));
                });
            }else{
                $('#add_to_family_modal .error').css("display", "block");
            }
        },

        /*Add Note*/
        onAddNote:function(question){
            this.set("questionSelected", question);
            this.set("questionNoteDetail", "");
            this.set("addFamilyNoteMessage", "");
            $('#add_note_modal .error').css("display", "none");
            $('#add_note_modal').modal("show");
        },

        onAddQuestionNote: function(){
             var controller = this,
                store = controller.store,
                questionNoteDetail = controller.get("questionNoteDetail");
            if (questionNoteDetail.trim()!==""){
                var note = store.createRecord("questionNote",{
                    question: controller.get("questionSelected"),
                    detail: questionNoteDetail
                });

                note.save().then(function(){
                    var successMessage  = I18n.t("questionLibrary.addNote.confirmationMessage") + controller.get("questionSelected.id");
                    controller.set("addFamilyNoteMessage", successMessage);
                });
            }
            else{
                $('#add_note_modal .error').css("display", "block");
            }

        },

        /*Add To Colecction*/
        addToCollection: function(question,questionSet){
            this.addQuestion(question,questionSet);
        },


        /**
         * Shows the chapters for mobile
         */
        onShowSearchLibrary: function () {
            this.transitionToRoute("/instructor/library/home/" + this.get("class").get("id"));
        },

        /**
         * Shows the question set list
         * For results the list shouldn't be displayed, but the left-menu requires this action
         */
        onShowQuestionSetList: function () {
            //at this page the question list for mobile should be always hidden
            this.set("hideQuestionSetList", false);
            this.set("showResults", false);
        },

        /**
        * Create a copy of Question Colletion
        **/
        copyQC: function(){
            this.get('createQuestionController').set("questionSet", this.get("questionSet"));
            this.get('createQuestionController').set("isCopyQc", true);
            this.openCreateQCMdl();
        },

        /**
        * Share Question Colletion
        **/
        shareQC: function(data) {
            var controller = this;
            var questionSet = controller.get("questionSet");
            var customCoInstructors = controller.get("customCoInstructors");
            if (customCoInstructors.length){
                QuestionSet.shareQuestionSet(questionSet.get('id'), customCoInstructors.mapBy("id").join(",")).then(function(){
                    controller.trigger('asyncButton.restore', data.component);
                    $("#shareqc-mdl").modal('hide');
                    $("#shareqc-mdl-success").modal('show');
                    $("#shareqc-mdl input[type='checkbox']").prop("checked", false);
                    controller.set("submittedCoInstructors", customCoInstructors.sortBy("lastName").mapBy("fullNameInformal"));
                    var submittedIds = customCoInstructors.mapBy("id");
                    var existingIds = controller.get("sharedWithCoInstructors");
                    submittedIds.addObjects(existingIds);
                    controller.set("sharedWithCoInstructors", submittedIds);
                    controller.get("customCoInstructors").clear();
                });
            } else {
                $("#shareqc-mdl .custom-error").show();
                controller.trigger('asyncButton.restore', data.component);
            }
        },

        selectCoInstructor: function(instructor){
            var controller = this;
            if ($("#share_qc_instructor_"+instructor.get("id")).prop("checked")){ //Add to the list of classes
                controller.get("customCoInstructors").pushObject(instructor);
            }else{
                var indexCoInstructor = controller.get("customCoInstructors").indexOf(instructor);
                if (indexCoInstructor > -1) {
                    controller.get("customCoInstructors").removeAt(indexCoInstructor, 1);
                }
            }
        },

        /**
         * delete Action
         */
        onDelete: function(){
            this.removeQuestionCollection();
        },

        /**
        * Add Questions to New QC Folder
        **/
        createQCWithQuestion: function(question){
            this.get('createQuestionController').set("question", question);
            this.openCreateQCMdl();
        },

        enterPreview: function() {
            this.set('preview', true);
            $('#preview-modal').modal('show');
            this.get("questionSet.questions").clear();
        },

        exitPreview: function() {
            this.set('preview', false);
        },

        onOrderList: function(question, newPosition){
            var controller = this;
            var questionSetId = controller.get("questionSet.id");
            QuestionSet.changeOrderOfQuestion(questionSetId, question.get('id'), newPosition).then(function(){
                controller.getPageQuestionCollectionResults(controller.get('currentPage'));
            });
        },

        gotoQCAssignment: function(){
            var clazz = this.get('class');
            var questionSet = this.get('questionSet');
            this.transitionToRoute('/instructor/manageAssignment/'+clazz.get('id')+'/0?qsId='+questionSet.get('id'));
        },

        showMoreAnswers: function(otherAnswers, showClassPercentages) {
            var otherAnswersForTextEntry = this.get('otherAnswersForTextEntry'),
                otherAnswersModal = $('#text-entry-modal');

            // Update data before showing the modal
            otherAnswersForTextEntry.clear();
            otherAnswersForTextEntry.pushObjects(otherAnswers);

            // Show the modal with the updated data
            if (showClassPercentages) {
                otherAnswersModal.addClass('class-percentages');
            } else {
                otherAnswersModal.removeClass('class-percentages');
            }
            otherAnswersModal.modal('show');
        },

        showImportModal: function() {
            var self = this,
                userId = context.get('authenticationManager').getCurrentUserId();

            this.set('isImportModalVisible', true);

            this.store.query("questionSet", {  userId: userId,
                                              subjectId: this.get('product').get('subject') })
                .then( function(questionSets) {
                    self.set('importModalQuestionSets', questionSets);
                }, function(reason) {
                    Ember.Logger.error(self.toString() + ': Error retrieving data for question collections -' + reason);

                    // Hide modal because there's no data to show
                    self.set('isImportModalVisible', false);
                });
        },

        openExportWindow: function(){
            var url = "/instructor/library/export/"+this.get('class.id')+"/"+this.get('questionSet.id');
            window.open("#" + url, "_blank");
        },

        openShareQCModal: function() {
            $("#shareqc-mdl .custom-error").hide();
            if(this.get('coInstructors').get("length")){
                $('#shareqc-mdl').modal('show');
            }
            else{
                $('#shareqc-mdl-no-instructors').modal('show');
            }
        },

        redirectToImport: function(questionSetId) {
            Ember.Logger.debug(this.toString() + ': redirecting to import question set with ID: ' + questionSetId);

            this.transitionToRoute('library.import', this.get('class.id'), questionSetId, this.get('questionSet.id'));
        },

        showModalQuestionTypeFilter: function() {
            this.set('isModalQuestionTypeSelectionVisible', true);
        },


        setQuestionStatusActive: function(data) {
            var controller = this;
            controller.changeQuestionStatus(data.param, "active");
        },

        setQuestionStatusOnHold: function(data) {
            var controller = this;
            controller.changeQuestionStatus(data.param, "on_hold");
        },

        setQuestionStatusRetire: function(data) {
            var controller = this;
            controller.changeQuestionStatus(data.param, "retired");
        },

        showQuestionHistoryModal: function(questionId) {
            var self = this;

            this.set('questionHistoryModal.isVisible', true);

            this.store.query("questionAudit", {  questionId: questionId })
                .then( function(auditItems) {
                    self.set('questionHistoryModal.data', auditItems);
                }, function(reason) {
                    Ember.Logger.error(self.toString() + ': Error retrieving data for question audit -' + reason);

                    // Hide modal because there's no data to show
                    self.set('questionHistoryModal.isVisible', false);
                });
        },

        /**
         * @see LibraryResultsController
         * @param question
         */
        createVariantQuestion: function(question){
            var classId = this.get("class").get("id");
            this.transitionToRoute("/instructor/library/createQuestion/" + classId + "/" + question.get("id") + "?variant=true");
        },

        showVariants: function(question, parentId) {
            var self = this,
                $variantContainer = $('.question-box #variantQ' + question.get("id"));
                $variantContainer.addClass("loading");

            // Disable link until the action is complete
            $variantContainer
                .find('a')
                    .attr('disabled', true)
                    .addClass('disabled');

            this.store.query("question", { parentsIds: [parentId],
                                          currentPage: 1,
                                          productId: this.get('product').get('id') })
                .then( function(familyQuestions) {
                    var questionList = self.get('questions'),
                        insertIdx = questionList.indexOf(question) + 1; // Insert after the question

                    familyQuestions.map( function(variant) {
                        // Mark the question as a variant
                        return variant;
                    }).forEach( function(variant) {
                        questionList.insertAt(insertIdx, variant._internalModel);
                    });
                    // Loading complete; restore link
                    self.restoreVariantTab($variantContainer);

                }, function(reason) {
                    Ember.Logger.error(self.toString() + ': Error retrieving data for question variants -' + reason);

                    // Restore link
                    self.restoreVariantTab($variantContainer);
                });
        },

        hideVariants: function(questionId) {
            var $variantContainer = $('.question-box #variantQ' + questionId),
                questionList = this.get('questions'),

                variants = questionList.filter( function(question) {
                    return question.get('parentId') === questionId;
                });

            $variantContainer.addClass("loading");

            variants.forEach( function(variant) {
                questionList.removeObject(variant);
            });

            this.restoreVariantTab($variantContainer);
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
