SakuraiWebapp.LibraryCreateQuestionController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,{
        queryParams: ['type', 'variant'],
        //Reference another contoller
        library: Ember.inject.controller(),
        //headerClasses: Ember.inject.controller(),
        //headerAdmin: Ember.inject.controller(),

        /**
         * @property {string} question type
         */
        type: null,

        /**
         * Indicates if it is creating a variant question
         * @property {bool}
         */
        variant: false,

        /**
         * @property {Question} Question Information
         */
        question: null,

        /**
         * @property {Class} selected class
         */
        class: Ember.computed.alias("library.class"),

        /**
         * All product term taxonomies
         * @property {SakuraiWebapp.TermTaxonomy[]}
         */
        allTermTaxonomies: Ember.computed.alias("library.allTermTaxonomies"),

        /**
         * @property {Ember.A} all products that this question may be related to. If the user is an instructor,
         * this will be equal to an empty array.
         */
        questionProducts: [],

        /**
         * Product learning objectives
         * @property {SakuraiWebapp.LearningObjective[]}
         */
        learningObjectives: null,

        /**
         * @property {Boolean} Is a question being created (true) or is it being edited (false)
         */
        isCreating: true,

        /**
         * @property {Boolean} Is major edit
         */
        isMajorEdit: false,

        /**
         * @property {Boolean} Product property about Allow Remediation Link
         */
        isRemediationLinkAllowed: false,

        /**
        * @property Array all the subjects
        */
        subjects: [],

        allProducts: [],

        allSections: [],

        allLO: [],


        /**
         * Init Question Object
         */
        initQuestion: function(question){
            var store = this.store,
                isCreating = !question,
                questionRecord = !isCreating ? question : store.createRecord("question", {active: true, interactions: []});
            this.set("isCreating", isCreating);
            this.set('question', questionRecord);
            if (!isCreating){
                this.set("type", question.get("questionType"));
            }
        },

        /**
         * @property {bool} indicates if it is a multiple choice question
         */
        isMultipleChoice: Ember.computed('type', function(){
            var type = this.get("type");
            return !type || type === SakuraiWebapp.Question.MULTIPLE_CHOICE;
        }),

        /**
         * @property {bool} indicates if it is a fill in the blank question
         */
        isFillInTheBlank: Ember.computed('type', function(){
            var type = this.get("type");
            return type === SakuraiWebapp.Question.FILL_IN_THE_BLANK;
        }),

        isChoiceMultiple: Ember.computed('type', function(){
            return this.get("type") === SakuraiWebapp.Question.CHOICE_MULTIPLE;
        }),

        isGraphicOption: Ember.computed('type', function(){
            return this.get("type") === SakuraiWebapp.Question.GRAPHIC_OPTION;
        }),

        isDragNDrop: Ember.computed('type', function(){
            return this.get("type") === SakuraiWebapp.Question.DRAG_AND_DROP;
        }),

        isHotSpot: Ember.computed('type', function(){
            return this.get("type") === SakuraiWebapp.Question.HOT_SPOT;
        }),

        goBackToResults: function(creating){
            var controller = this;
            if (!SakuraiWebapp.context.isTesting()){ //back is not supported on tests 
                var steps = (creating && controller.get("isAuthoringEnabled")) ? -2 : -1;
                window.history.go(steps); //PhantomJS doesn't support Web Components
            }
        },

        actions:{
            saveQuestion: function(question, isMajorEdit, isCreatingVariant, saveButton, onSaveCallback){
                var controller = this,
                    store = controller.store,
                    authenticationManager = SakuraiWebapp.context.get('authenticationManager'),
                    user = authenticationManager.getCurrentUser(),
                    userId = user.get("id"),
                    productId = controller.get("class.product.id"),
                    editing = !controller.get("isCreating"),
                    copyQuestion = editing && ( isMajorEdit || isCreatingVariant );

                var saveIt = function(question){
                    Ember.RSVP.hash({ //sets the product and user for the question
                        "product" : store.find("product", productId),
                        "user" : store.find("user", userId)
                    }).then(function (hash) {
                        question.set('product', hash.product);
                        if (user.get("isAdmin")){
                            if(!editing) {
                                question.set('author', hash.user);
                            }
                        }
                        else{
                            question.set('instructor', hash.user);
                        }
                        question.save().then(function (result) {
                            // Resets the save button if the validation process failed for all question types
                            if (saveButton) {
                                saveButton.restoreButton(saveButton.get('id'));
                            }

                            if (!editing || isMajorEdit) {
                                // increase the 'created questions' counter
                                controller.get("library").incTotalCreatedQuestions();
                                controller.set("question", question);
                            }
                            $('#success-modal').modal('show');
                            if (onSaveCallback){
                                onSaveCallback(result);
                            }
                        });
                    });

                };
                if (copyQuestion){
                    var promise = SakuraiWebapp.Question.copyQuestionRecord(store, question);
                    promise.then(function(copiedQuestion){
                        copiedQuestion.set("variant", isCreatingVariant);
                        if(isMajorEdit) {
                            copiedQuestion.set("parentId", null);
                            controller.set("isMajorEdit", true);
                        }
                        saveIt(copiedQuestion);

                        //Rollbacks changes for the original question
                        question.rollbackAttributes();
                    });
                }
                else{
                    saveIt(question);
                }
            },

            returnToQuestionLibrary: function(){
                $('#success-modal').modal('hide');
                this.goBackToResults(this.get("isCreating"));
            },

            cancelChanges:function(question){
                //Rollbacks changes for the original question
                question.rollbackAttributes();
                this.goBackToResults(this.get("isCreating"));
            }
        }
    });
