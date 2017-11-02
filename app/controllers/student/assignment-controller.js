SakuraiWebapp.StudentAssignmentController = Ember.Controller.extend(
    Ember.Evented,
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin, {

    headerClasses: Ember.inject.controller(),

    /**
     * @property {SakuraiWebapp.Assignment} assignment
     */
    assignment: null,

    /**
     * @property {Class} selected class
     */
    class: null,

    /**
     * @property {number} selected num of questions
     */
    numQuestionsSelected: 5,

    /**
     * @property {number} selected num of questions
     */
    numQuestions: [],

    /**
    * @property {boolean}
    */
    classHideThresholdLabels: 0,

    /**
    * @property {boolean}
    */
    classCustomThreshold: 4,

    /**
    Failed Message when try start quiz
    **/
    failedMessage: "",

    /**
    * List of ML quizzes
    **/
    quizzesML: null,

    /**
     * @property {JSON} indicate Current Page and Total Pages
     */
    metadataML: {},

    /**
     * @property {num} indicate Student Id
     */
    studentId: null,

    /**
    * @property Show/hide list of ML quizzes
    */
    showQuizzes: false,

    /**
     * if we are showing the quiz list
     * @property {Bool}
     */
    showMLQuizzesList: Ember.computed(function(){
        return this.showModuleByToggle("assignmentRelatedQuizzes");
    }),

    /**
     * @property return if the assignment is metadata and has chapters
     */
    isTermTaxonomyNursingTopic: Ember.computed('assignment.chapter','isMetadataAllowed', function(){
        return this.get('isMetadataAllowed') && this.get('assignment').get('hasChapter');
    }),

    /**
     * @property {string} manage the message if time is more than 10 (pluralize logic)
     */
    timeUnit: Ember.computed('assignment.timeLimit', function(){
        var time = this.get('assignment').get('timeLimit');
        var message = null;

        if(time > 1){
            message = 'assignment.minutes';
        }else{
            message = 'assignment.minute';
        }

        return I18n.t(message);
    }),

    /**
     * @property {string} label for the selected term taxonomy type
     */
    termTaxonomyLabel: Ember.computed("assignment.termTaxonomy", function(){
        var product = this.get("class").get("product");
        var assignment = this.get("assignment");

        if (!assignment.get("hasTermTaxonomy")) return;

        var taxonomy = assignment.get("termTaxonomy");
        var key = SakuraiWebapp.TermTaxonomy.getParentType(product, taxonomy);
        var termTaxonomyAllowed = SakuraiWebapp.Product.termTaxonomyAllowedByKey(product, key);
        return termTaxonomyAllowed.label;
    }),

    /**
     * @property {bool} indicates if it has quizzes
     */
    hasQuizzes: Ember.computed("quizzesML", function(){
        //return true;
        return this.get("quizzesML") && this.get("quizzesML").get("content").get("length") > 0;
    }),

    isQuizHistory: false,
    /**
     * Saves a quiz using the parameters
     * @param parameters
     * @param data
     */
    saveQuiz: function(parameters, data){
        var controller = this;
        var store = controller.store;
        var record = SakuraiWebapp.Quiz.createQuizRecord(store,  parameters);
        record.then(function(quiz){
            var promise = quiz.save();
            promise.then(function (quiz) {
                if (quiz.get('id')) {
                    controller.trigger('asyncButton.restore', data.component);
                    controller.transitionToRoute("/quiz/quizzer/" + quiz.get('id') + "/" + controller.get("class.id"));
                    controller.set("failedMessage", "");
                }
            },function(reason){
                controller.trigger('asyncButton.restore', data.component);
                if ((reason.status == 400) && ($.parseJSON(reason.responseText).errors[0].code=="missing_questions")) {
                    controller.set("failedMessage", I18n.t('assignment.failedMessage') + " " + data.get("name"));
                }
            });
        })
    },

    /**
     * Saves an exam
     * @param parameters
     * @param data
     */
    saveExam: function (parameters, data){
        var controller = this;
        var store = this.store;
        var record = SakuraiWebapp.Exam.createExamRecord(store, {
            examLength: parameters.examLength,
            timeLimit: parameters.timeLimit,
            student: parameters.student,
            class: parameters.class,
            assignment: parameters.assignment
        });

        record.then(function(exam){
            var promise = exam.save();
            promise.then(function (exam) {
                if (exam.get('id')) {
                    controller.trigger('asyncButton.restore', data.component);
                    controller.transitionToRoute("/quiz/quizzer/" + exam.get('id') + "/" + controller.get("class.id") + "?isExam=true");
                }
            });
        });
    },

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
                }
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
        return value ? (value == "undefined" ? defaultValue : value) : defaultValue
    },
    /*
        Update Quizzes list with another Criteria
    */
    updateList: function(type, metadata){
        var controller = this,
            store = controller.store;
        var chapterId = controller.getDefaultValue("currentChapter") != -1 ? controller.getDefaultValue("currentChapter", null) : null;
            termId = controller.getDefaultValue("currentSubcategory", null);
        var filterId = chapterId ? chapterId : termId;
        //If category is NURSING_TOPICS the filter will go to 'chapterId' otherwise to 'termId'
        if( controller.get("categoryId") == SakuraiWebapp.Section.NURSING_TOPICS) {
            chapterId = filterId;
            termId = null;
        } else {
            chapterId = null;
            termId = filterId;
        }
        var params = {
                studentId: controller.get("studentId"),
                type: metadata.criteria.type,
                currentPage: metadata.pagination.currentPage,
                pageSize: metadata.pagination.pageSize,
                sort: metadata.pagination.sort,
                direction: metadata.pagination.direction,
                totalResults: metadata.pagination.totalResults,
                chapterId: chapterId,
                termId: termId,
                assignmentId: controller.get("assignment.id")
            };


        store.find("quiz", params).then(function(quizzes){ //Update quiz list
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

        /**
         Starts a new quiz
         **/
        startQuiz: function (data) {
            var controller = this;
            var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
            var user = authenticationManager.getCurrentUser();


            var assignment = controller.get("assignment");
            var parameters = {
                student: user,
                class: controller.get('class'),
                assignment: assignment
            };

            if (assignment.get("isQuestionCollectionAssignment")){
                parameters.quizLength = assignment.get("totalQuestions");
                controller.saveQuiz(parameters, data);
            }
            else{
                parameters.quizLength = controller.get("numQuestionsSelected");

                var isChapter = (!this.get("isMetadataAllowed") || this.get("isTermTaxonomyNursingTopic"));
                var promise = isChapter ? assignment.get("chapter") : assignment.get("termTaxonomy");
                promise.then(function(data){
                    parameters.chapters = isChapter ? [data] : [];
                    parameters.termTaxonomies = !isChapter ? [data] : [];
                    controller.saveQuiz(parameters, data);
                })
            }
        },

        /**
         * Starts an exam
         * @param data
         */
        startExam: function(data){
            var controller = this;
            var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
            var user = authenticationManager.getCurrentUser();


            var assignment = controller.get("assignment");
            var parameters = {
                student: user,
                class: controller.get('class'),
                assignment: assignment,
                examLength: assignment.get('numberQuestion'),
                timeLimit: assignment.get('timeLimit')
            };

            controller.saveExam(parameters, data);
        },

        goToQuiz: function(id){
            this.transitionToRoute("/quiz/quizzer/" + id + "/" + this.get("class.id") + "?animation=false");
        },

        goToExam: function(id){
            this.transitionToRoute("/quiz/quizzer/" + id + "/" + this.get("class.id") + "?animation=false&isExam=true");
        },

        onSortByCriteria: function(sortableId, criteria){
            this.sortByCriteria(sortableId, criteria);
        },

        viewResults: function(id, isReviewRefresh){
            var url = "";
            if (isReviewRefresh) {
                url = "/quiz/result/" + id + "/" + this.get("class.id") + "?quizHistory=true&isReviewRefresh=true";
            } else {
                url = "/quiz/result/" + id + "/" + this.get("class.id") + "?quizHistory=true";
            }
            this.transitionToRoute(url);
        },

        toggleQuizzesList: function() {
            controller = this;
            var quizParams = {
                assignmentId: this.get("assignment").get("id"),
                studentId: this.get("studentId"),
                type: 'mastery_level',
                currentPage: 1,
                pageSize:10,
                sort:"startedOn",
                direction:"DESC"
            };
            controller.toggleProperty('showQuizzes');
            var promise = controller.store.query('quiz',quizParams);
            promise.then(function(quizzes) {
                controller.set('quizzesML', quizzes);
                if (quizzes.content.get("length")!=0){
                    var store = controller.store;
                    controller.updateMetadata(quizzes.get('meta'), "metadataML");
                    controller.setPagination('ML');
                }
            });



        }
    }

});
