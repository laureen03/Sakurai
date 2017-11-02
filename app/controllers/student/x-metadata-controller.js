SakuraiWebapp.StudentMetadataController = SakuraiWebapp.StudentSectionController.extend(
    Ember.Evented,
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,{

    queryParams: ["type", "ms", "activeRR"],

    /**
    * @ Property {array} get rules for topics selected vs amount od questions
    **/
    rapidML_rules: [
        {"questions": 5, "maxTopics": 1},
        {"questions": 10, "maxTopics": 1},
        {"questions": 20, "maxTopics": 4},
        {"questions": 50, "maxTopics": 10},
    ],

    /**
     * @property Defines which metadata is selected by default
     */
    ms: null,

    /**
     * @property {string} term taxonomy type parameter
     */
    type: null,

    /**
     * @property if Quiz Review and Refresh is active.
     */
    activeRR: null,

    /**
     * @property metadata
     * Object with all metadata
     * Return Object
     */
    metadata: null,

    /**
     * @property class
     *
     */
    class: null,

    /**
     * @property {String} Term Taxonomy type selected by drop down
     *
     */
    selectedTermTaxonomy: null,

    /**
    Failed Message when try start quiz
    **/
    failedMessage: "",

    /**
    * @property {Boolean} Flag to control if R&R is on or of for the quiz.
    **/
    isReviewRefresh: false,

    /**
     * List of Number of question the user can choose for
     * @property []
     **/
    numQuestionsAvailable: Ember.computed('isReviewRefresh', function(){
        //Reset the select field, if not the old value will sometimes get sent to quiz creattion
        //There are more the 4 repetitions of this line in this controller.
        //Is there a better way of handling this?
        this.set("numQuestionsSelected", 5);
        return this.get('isReviewRefresh') ? this.get("numQuestionsRR"): this.get("numQuestions");
    }),

    /*
    * Property {reviewRefreshClassSetting} Manage the quiz type radio
    */
    reviewRefreshClassSettings: null,

    /*
    * Property {notEnoughQuestions} not enough questions array with length of quiz selected
    */
    notEnoughQuestions: [],

    /**
     * Updates metadata when the selection is changed
     */
    updateMetadata: Ember.observer('selectedTermTaxonomy', function(){
        var controller = this;
        if (controller.get("isDestroyed")) return;

        var store = controller.get("store");
        var type = controller.get('selectedTermTaxonomy');
        if (type){
            if (type == SakuraiWebapp.Section.NURSING_TOPICS){
                var clazz = this.get("class");
                controller.transitionToRoute("/student/section/" + clazz.get('id') + "?activeRR=" + controller.get("activeRR"));   
            }
            else{
                var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
                //Check if taxonomy tag exist
                var taxonomyTag = authenticationManager.get("taxonomyTag");

                if (this.validateTaxonomyTagConcepts(type))
                { //Find by GuID
                    SakuraiWebapp.TermTaxonomy.findTermTaxonomyByTaxonomyTag(store, taxonomyTag, controller.get("class").get("id"))
                    .then(function(metadata){
                        controller.set("metadata", SakuraiWebapp.TermTaxonomy.convertTaxonomyTagToTree(metadata, type));
                    });
                }else{ //Find by ParentName
                    SakuraiWebapp.TermTaxonomy.findTermTaxonomyByParentName(store, type, controller.get("class").get("id"))
                    .then(function(metadata){
                        controller.set("metadata", SakuraiWebapp.TermTaxonomy.convertToTree(metadata, type))
                    });
                }

            }
        }
    }),

    /**
     * Method resetValues
     * Clean all the variable set
     */
    resetValues:function(){
        this.set('termTaxonomyTypeOptions', null);
        this.set('metadata', null);
        this.set('type', null);
        this.set('ms', null);
        this.set('selectedTermTaxonomy', null);
        this.set("failedMessage", "");
        this.set("isReviewRefresh", false);
        this.set("reviewRefreshClassSettings", null);
        this.set("notEnoughQuestions", []);
    },

    /**
     * Returns a promise that resolves to an array of terms
     * @returns Em.RSVP.Promise
     */
    getSelectedTerms: function () {

        var self = this,
            promises = $("input[name=metadata]:checked", "#chapters").map(function () {
                            return self.store.find('termTaxonomy', parseInt($(this).val()));
                       }).get();

        return Em.RSVP.all(promises);
    },

    /**
    * Validate if the rules of questions vs taxonomies selected are fine
    **/
    validate_rapid_ML: function(lengthTopics, amountQuestions){
        var controller = this,
            rules = controller.get("rapidML_rules"),
            isValid = true;

        rules.forEach(function(currentValue,index,arr){
            if (amountQuestions == currentValue.questions && lengthTopics> currentValue.maxTopics){
                controller.set("rapidML_message", I18n.t("quiz.failedRapidML", {count:currentValue.maxTopics, amount : currentValue.maxTopics, questions : currentValue.questions}))
                $('.chapters-container input[type=checkbox]').prop('checked', false);
                isValid = false;
            }
        });
        return isValid;
    },

    actions: {
        createQuiz: function (data) {
            var self = this,
                authenticationManager = SakuraiWebapp.context.get('authenticationManager'),
                user = authenticationManager.getCurrentUser(),
                store = self.store;

            this.set("noChaptersSelectedError", false);

            this.getSelectedTerms().then( function (terms) {

                var validAmountQuestion = self.validate_rapid_ML(terms.length, self.get("numQuestionsSelected"));

                if (terms.length > 0 && validAmountQuestion) {

                    if (self.get("isReviewRefresh")) {
                        var record = SakuraiWebapp.ReviewRefreshQuiz.createQuizRecord(store, {
                            quizLength: self.get("numQuestionsSelected"),
                            termTaxonomies: terms,
                            student: user,
                            class: self.get('class')
                        });
                    }else{
                        var record = SakuraiWebapp.Quiz.createQuizRecord(store, {
                            quizLength: self.get("numQuestionsSelected"),
                            termTaxonomies: terms,
                            student: user,
                            class: self.get('class')
                        });
                    }

                    record.then(function(quiz){
                        var promise = quiz.save();
                        promise.then(function (quiz) {
                            if ( quiz.get('id') ) {
                                self.trigger('asyncButton.restore', data.component);
                                if (!self.get('isReviewRefresh'))
                                    self.transitionToRoute("/quiz/quizzer/" + quiz.get('id') + "/" + self.get("class.id"));
                                else
                                    self.transitionToRoute("/quiz/quizzer/" + quiz.get('id') + "/" + self.get("class.id") + "?isReviewRefresh=true");
                            }
                        },function(reason){
                            self.trigger('asyncButton.restore', data.component);
                            if ((reason.status == 400) && ($.parseJSON(reason.responseText).errors[0].code=="missing_questions")) {
                                var message = $.parseJSON(reason.responseText).errors[0].info;
                                var n = message.lastIndexOf(" ");
                                var code = message.substr(n + 1, message.length-1);
                                var taxonomy = self.store.find("termTaxonomy", code).then(function(term){
                                    self.set("failedMessage", self.get("numQuestionsSelected") > 5 ? I18n.t('quiz.failedMessage') : I18n.t('quiz.failedFiveQuestionMessage'));
                                    self.set("numQuestionsSelected", 5);
                                    $('.questions-desc select').attr('disabled', true);
                                    var ids = $("input[name=metadata]:checked", "#chapters").map(function () {
                                        return $(this).val()
                                    });
                                    var ids_str = ids.get().sort().join();
                                    var hasMetadata = self.get("notEnoughQuestions").findBy('ids', ids_str);
                                    if(!hasMetadata) {
                                        self.get("notEnoughQuestions").pushObject(Ember.Object.create({ids: ids_str, length: self.get("numQuestionsSelected")}));
                                    }
                                });
                            }
                        });
                    });

                } else {
                    self.trigger('asyncButton.restore', data.component);
                    if (!validAmountQuestion)
                        $("#rapidMLErrorPopUp").modal("show");
                    else
                        self.set("noChaptersSelectedError", true);
                }
            });
        },

        onSetInactive: function(inactiveTopics, isReviewRefresh, autoQuizType){
            var controller = this;
            controller.set("numQuestionsSelected", 5);
            controller.set('isReviewRefresh', isReviewRefresh);
            controller.set('activeRR', isReviewRefresh);
            if(!autoQuizType) {
                $('.chapters-container input[type=checkbox]').prop('checked', false);
                controller.set('ms', null);
            }

            if (inactiveTopics.length > 0)
                inactiveTopics.forEach(function(topicId) {
                    $('.item_' + topicId).addClass("disabled");
                });
            else
                $('.chapters-container .disabled').removeClass("disabled");
        },

        selectMetadata: function() {
            var ids = $("input[name=metadata]:checked", "#chapters").map(function () {
                return $(this).val()
            });
            var ids_str = ids.get().sort().join();
            var hasMetadata = this.get("notEnoughQuestions").findBy('ids', ids_str);
            if(!hasMetadata) {
                this.set("failedMessage", "");
                $('.questions-desc select').attr('disabled', false);
            } else {
                this.set("failedMessage", hasMetadata.get('length') > 5 ? I18n.t('quiz.failedMessage') : I18n.t('quiz.failedFiveQuestionMessage'));
                this.set("numQuestionsSelected", 5);
                $('.questions-desc select').attr('disabled', true);
            }
        }
    }

});
