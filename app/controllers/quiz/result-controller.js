SakuraiWebapp.QuizResultController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,
    SakuraiWebapp.QuestionPartialMixin,{
//
    queryParams: ["quizHistory", "isReviewRefresh", "categoryId", "subcategoryId", "chapterId"],

    currentQuestion: null,
    chapterId: null,
    categoryId: null,
    subcategoryId: null,
    isMultiple: false,
    componentName: "question-choice",

    fullQuestionActive: false,

    /**
     * @property {bool} is the quiz from the quiz history?
     */
    quizHistory: false,

    /**
     * @property {bool} is a ReviewRefresh Quiz
     */
    isReviewRefresh: false,

    /**
     * @property {QuizResult} quiz result information
     */
    quizResult: null,

    /**
     * @property {Class} the quiz class
     */
    class: null,

    /**
     * @property {ChapterStat | TermTaxonomyStat}  statistic information for chapter or taxonomy performance
     */
    stats: null,

    isNotTypeQC: Ember.computed('assignment', function(){
        return !(this.get('assignment') && this.get('assignment').get('isQuestionCollectionAssignment'))
    }),

    hasTimeLimit: Ember.computed('assignment', function(){
        return (this.get('assignment') && this.get('assignment').get('hasTimeLimit'));
    }),

    isAutoSubmitted: Ember.computed('assignment', function(){
        return (this.get('assignment') && this.get('assignment').get('isAutoSubmitted'));
    }),

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
     * @property {bool} indicates if it has quizzes
     */
    hasQuizzes: Ember.computed("quizzesML", function(){
        //return true;
        return this.get("quizzesML") && this.get("quizzesML").get("content").get("length") > 0;
    }),

    isQuizHistory: false,

    /**
     * @property return if the assignment is metadata and has chapters
     */
    isTermTaxonomyNursingTopic: Ember.computed('hasChapters','isMetadataAllowed', function(){
        return this.get('isMetadataAllowed') && this.get('hasChapters');
    }),

    /**
     * @property conveniecne method for testing the existance of chpaters
     */
    hasChapters : Ember.computed('quiz.chapters.[]', function(){
        return this.get('quiz') ? this.get('quiz').get('hasChapters') : false;
    }),

    /**
     * @property {Assignment} the first assignment found for the quiz result
     * This is used for QC assignments or metadata quiz, to check the type and answerKeyView field
     * and all values related to assignment itself
     */
    assignment: null,

    /**
     * @property {Quiz} the quiz
     */
    quiz: null,

    nursingTaxonomyPerformances: function() {
        var controller = this;
        return DS.PromiseArray.create({
            promise: new Ember.RSVP.Promise(function (resolve, reject) {
                controller.get("stats").get("termTaxonomyPerformances").then(function (termTaxonomyPerformances) {
                    var promises = controller.get("stats").get("termTaxonomies");

                    Ember.RSVP.all(promises).then(function () {
                        resolve(termTaxonomyPerformances.filterBy("isNursingConcepts", true));
                    });
                });
            })
        });
    },

    statsPerformance: Ember.computed('stats', function(){
        var controller = this;
        if (controller.get("stats")) {
            if (controller.get("isMetadataAllowed") && !controller.get('hasChapters')){
                return controller.get("stats").get("termTaxonomyPerformances");
            }
            else{
                return controller.get("stats").get("chapterPerformances");
            }
        }
    }),

    /**
     * Returns the performance stats when the user had an improvement
     * @returns {[]}
     */
    improvedStatsPerformance: Ember.computed('statsPerformance.[]', function(){
            var stats = this.get("statsPerformance");
            var controller = this;
        if (!controller.get("quizHistory") && stats) {
            return stats.filter(function (performance) {
                var quizOk = performance.get("currentQuiz") === parseInt(controller.get("quiz.id"));
                return performance.get("hasImprovement") && quizOk;
            });
        }
        return Ember.A();
    }),

    /**
     * @property {Ember promise} contains the quiz result stats text
     * both for title and link
     */
    statsText: Ember.computed("stats", "isMetadataAllowed", function(){
        var controller = this;
        var link;
        return DS.PromiseObject.create({
            promise: new Ember.RSVP.Promise(function(resolve, reject){
                if (controller.get("isMetadataAllowed") && !controller.get('hasChapters') && controller.get("quiz")){
                    controller.get("stats").get("nursingTaxonomyPerformances")
                        .then(function(performances){
                            var isNursing = (performances.get("length") > 0);

                            var termTaxonomy =  ((isNursing) ? I18n.t('haid.nursingConcepts') : I18n.t('haid.clientNeeds'));
                            var title = I18n.t('common.performanceBy')+ ' ' + termTaxonomy;
                            var link = I18n.t('common.viewPerformance')+ ' ' + termTaxonomy;
                            var whatsthisTitle = "What is " + title + "?";
                            resolve({
                                title:title,
                                link:link,
                                whatsthisTitle:whatsthisTitle
                            });
                        });

                }else{
                    var link = I18n.t('common.viewPerformance') + ' ' + controller.get("terminologyTermPlural");
                    var title = I18n.t('common.performanceBy') + ' ' + controller.get("terminologyTermSingular");
                    var whatsthisTitle = "What is " + title + "?";
                    resolve({
                        title:title,
                        link:link,
                        whatsthisTitle:whatsthisTitle
                    });
                }
            })
        });
    }),

    /**
     * @property {bool} indicates if it can increment the remediation link view
     * @see SakuraiWebapp.QuestionPartialMixin
     */
    canIncRemediationLinkView: Ember.computed(function(){
        return true;
    }),

    rotateElement: function(arrow, deg){
        arrow.css('-ms-transform', 'rotate('+deg+')'); /* IE 9 */
        arrow.css('-webkit-transform', 'rotate('+deg+')'); /* Chrome, Safari, Opera */
        arrow.css('transform', 'rotate('+deg+')');
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

    actions:{
        showFullQuestion:function(answer, template){
        	var controller = this;
                controller.set("componentName", template);
        	answer.get("question").then(function(value) {
    			controller.set("currentQuestion", value);
    			//Check if is choice if is multiple or single choice
    			value.get("interactions").forEach(function(item) {
       	       		if (item.type === SakuraiWebapp.Question.CHOICE){
       	          		if ((item.maxChoices == 1) && (item.maxChoices == 1))
    				        controller.set("isMultiple", false);
    				    else
    				        controller.set("isMultiple", true);
    				}
    			});

    			$('#fullQuestion').modal('show');
    		});
        },

        onSectionDisplay: function(selector_id, section){
            var section_div = $('#'+section+'-content-'+selector_id),
                arrow = $('.arrow-'+section+'-'+selector_id);
            if (section_div.hasClass('hide')){
                this.rotateElement(arrow, '-30deg');
                section_div.removeClass('hide');
            }
            else{
                this.rotateElement(arrow, '0deg');
                section_div.addClass('hide');
            }
        },

        goToQuizHistory: function(classId) {
            var controller = this;
            var queryParams = ["categoryId", "subcategoryId", "chapterId"];
            var tokens = [];
            for(var pos=0; pos<queryParams.length; pos++) {
                if(controller.get(queryParams[pos])) {
                    tokens.push(queryParams[pos]+"="+controller.get(queryParams[pos]));
                }
            }
            var url = "/student/history/" + classId;
            if(tokens.length) {
                url = url+"?"+tokens.join('&');
            }
            controller.transitionToRoute(url);
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
            var assignmentId = controller.get("quizResult").get("assignments").objectAt(0) ? controller.get("quizResult").get("assignments").objectAt(0).get("id") : null;

            var quizParams = {
                assignmentId: assignmentId,
                studentId: controller.get("studentId"),
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
