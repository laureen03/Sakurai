SakuraiWebapp.LibraryResultsRoute = Ember.Route.extend({
    queryParams: {
        qsId: { refreshModel: true },
        instructorId: { refreshModel: true },
        preview: { refreshModel: true },
        questionTypes: { refreshModel: true },
        currentPage: { currentPage: 1 },
        pageSize: { pageSize: 25 },
        pagination: { pagination: 1 },
        direction: { direction: true },
        sort: { sort: true }
    },

    activate: function() {
        if (!this.get("controller.scrollTo")){
            $("html, body").animate({ scrollTop: 0 }, "slow");
        }
    },
    
    model: function (params) {
        var store = this.store;
        
        var hasQuestionSet = !!params.qsId,
            sort = undefined;
            page = !!params.currentPage ? params.currentPage : 1,
            pageSize = params.pagination ? params.pageSize * params.currentPage : !!params.currentPage ? (params.currentPage * 25) : 25;

        //Validate if Page size is min 25 questions
        pageSize = (pageSize < 25) ? 25: pageSize;
        
        if (!params.scrollTo){ //When scroll To is null
            if (params.pagination)
                sort = undefined; //Reset Sort option
        }

        // Set search queryParams
        var queryParams = {
            "term": !!params.term ? params.term : undefined,
            "sectionIds": !!params.cid ? params.cid.split("-") : undefined,
            "questionSetId" : hasQuestionSet ? params.qsId : undefined,
            "termTaxonomyIds": !!params.termTaxonomyIds ? params.termTaxonomyIds.split("-") : undefined,
            "instructorId": !!params.instructorId ? params.instructorId : undefined,
            "questionTypes": !!params.questionTypes ? params.questionTypes.split("-") : undefined,
            "classIds": !!params.classIds ? params.classIds.split("-") : undefined,
            "ids": !!params.questionId ? [params.questionId] : undefined,
            "authorIds": !!params.authorIds ? params.authorIds.split("-") : undefined,
            "questionStatus": !!params.questionStatus ? params.questionStatus.split("-") : undefined,
            "classMisconception": !!params.classMisconception ? params.classMisconception : undefined,
            "direction" : (!!params.pagination && !params.classMisconception) || !!params.direction ? params.direction : undefined,
            "sort" : !!params.pagination || !!params.sort ? params.sort : undefined,
            "isQuestionLibrary" : 1,
            "otherProductIds": !!params.otherProductIds ? params.otherProductIds.split("-") : undefined,
            "difficulty": !!params.difficulty ? params.difficulty.split("-") : undefined,
        };

        if (!params.preview) {
            // The preview modal must show all the questions of a question collection
            // So if we're not showing the preview modal, then we only want to
            // show the questions for the first page
            queryParams.currentPage = 1;
            queryParams.pageSize = pageSize;
        }else{
            page = undefined;
            pageSize = undefined;
        }

        return new Ember.RSVP.Promise(function(resolve, reject){
            store.find("class", params.classId).then(function(clazz){
                clazz.get("product").then(function(product){

                    queryParams.productId = product.get("id");

                    Ember.RSVP.hash({
                        class : clazz,
                        questions : !hasQuestionSet ? store.query("question", queryParams): null,
                        questionSet: hasQuestionSet ? store.query("questionSet", {"questionSetId": params.qsId, "currentPage": page, "pageSize":pageSize}) : null,
                        hasQuestionSet: hasQuestionSet,
                        isPreview: params.preview
                    }).then(function(hash){ resolve(hash); }, reject);
                });

            }, reject);
        });

    },

    afterModel: function(model, transition) {
        /*return model.hasQuestionSet ? SakuraiWebapp.QuestionSet.fetch(model.questionSet.get('firstObject')).then(function(data){
                    model.questionSet = data;
                }): null;*/
    },

    setupController: function (controller, model) {
        if (controller.get("instructorId")){
            controller.resetValues(); //clears values for created questions
        }

        var store = this.store,
            questionSet = null;
        controller.set("showResults", true);
        controller.set("hideQuestionSetList", true);
        controller.set("questionSetEditMode", false);

        if (model.questionSet){
            questionSet = model.questionSet.get('firstObject');
            questionSet.rollbackAttributes();
        }

        if (questionSet){
            controller.set('questionSet', questionSet);
            if (!model.isPreview){
                controller.set("questions", questionSet.get("questions"));
                var metadata = model.questionSet.get('meta');
                controller.updateMetadataQC(metadata);
                controller.initQuestionCollectionPagination();
                controller.setOrderList();
            }
        }
        else{
            var metadata = model.questions.get('meta');
            controller.updateMetadata(metadata);

            if (controller.get("scrollTo") == null){
                controller.set("sortId", 1);
            }

            var criteria = metadata.criteria;
            controller.set('criteria', criteria);
            controller.set('questions', model.questions);
        }

        controller.set("product", model.class.get("product"));
        controller.set("sortOptions", SakuraiWebapp.Question.getSortOptions(controller.get("isAuthoringEnabled")));
    },

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }

});
