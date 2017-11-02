SakuraiWebapp.StudentHistoryRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    model: function(params) {
        var store = this.store;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var userId = authenticationManager.getActiveUserId();
        //Clear Storage for quiz, because show the quiz history with wrong results

        //TODO: This is a workaround because store.unloadAll('quiz') is failing
        //by a bug of ember-data beta.16, Please review again when undate the Ember data.
        //https://github.com/emberjs/data/issues/2982
        var records = store.peekAll('quiz');
        records.forEach(function(record) {
          store.unloadRecord(record);
        });

        var chapterId = params.chapterId ? ((params.chapterId == undefined||params.chapterId == "undefined") ? null : params.chapterId) : null,
            termId = params.subcategoryId ? ((params.subcategoryId == undefined||params.subcategoryId == "undefined") ? null : params.subcategoryId) : null,
            categoryId = params.categoryId ? ((params.categoryId == undefined||params.categoryId == "undefined") ? null : params.categoryId) : null;
        //If category is enabled and category is NURSING_TOPICS we will set the value in subcategory to chapterId
        var filterId = chapterId ? chapterId : termId;
        if(categoryId == SakuraiWebapp.Section.NURSING_TOPICS) {
            chapterId = filterId;
            termId = null;
        } else {
            chapterId = null;
            termId = filterId;
        }
        var quizParams = {
            classId: params.classId,
            studentId: userId,
            type: 'mastery_level',
            currentPage: 1,
            pageSize:10,
            sort:"startedOn",
            direction:"DESC",
            initFilters: 1,
            chapterId: chapterId,
            termId: termId
        };

        return Ember.RSVP.hash({
            clazz : store.find("class", params.classId),
            quizzesML: store.query("quiz", quizParams),
            studentId: userId,
            //Load sections. they will be used to get the chapters (children of units)
            chapters: store.query("section", { classId:params.classId, studentId: userId})
        });
    },

    afterModel: function(model){
        /* From instructor, begin*/
        return Ember.RSVP.hash({
            "product": model.clazz.get("product")
        }).then(function (hash) {
            model.product = hash.product;
        });
        /* From instructor, end*/
    },

    setupController: function(controller, model) {
        var product = model.product;
        controller.set('product', product);
        controller.set("class", model.clazz);
        controller.set("quizzesML", model.quizzesML);
        controller.set("studentId", model.studentId ? model.studentId : model.id);
        var filterData = controller.store._metadataFor("quiz").filterData || {};
        controller.set("filterData", filterData);

        if (model.quizzesML.content.get("length")!=0){
            var store = controller.store;
            controller.updateMetadata(store._metadataFor("quiz"), "metadataML");
        }
        var taxonomySettings = product.get("taxonomySettings");
        var allowedTypes = taxonomySettings.allowedTypes || [];
        var allowedTypesIndex = {};
        for(var i=0; i<allowedTypes.length; i++) {
            allowedTypesIndex[allowedTypes[i].key] = allowedTypes[i];
        }
        var chaptersIndex = [];
        var chaptersData = filterData.chapters || [];
        for (var n = 0; n < chaptersData.length; n++) {
            chaptersIndex[chaptersData[n].id] = chaptersData[n];
        }
        var options = Ember.A(), optionGroup = null;
        model.chapters.forEach(function (section) {
            section.get("children").then(function (children) {
                //Build a group with chapter in that section
                optionGroup = [];
                children.forEach(function (child) {
                    if (chaptersIndex[child.get('id')]) {
                        optionGroup.push(Ember.Object.create(
                            {
                                id: child.get('id'),
                                name: child.get('name'),
                                group: section.get('name'),
                                externalId: child.get("externalId")
                            }
                        ));
                    }
                });
                //If the group is not empty add it to the options
                if (optionGroup.length > 0) {
                    options.pushObjects(optionGroup);
                }
            });
        });
        controller.set("chapterList", options);
        var categoryListData = filterData.categories||[];
        controller.set("termTaxonomyTypeOptions", categoryListData);
        var categoryList = [];
        //Build an index categoryId => option groups
        var categoryListIndex = {};
        for (var n = 0; n < categoryListData.length; n++) {
            var category = categoryListData[n];
            //If the category is not found in the allowed types we skip it, but this should not happen
            if(!allowedTypesIndex[category.code]) {
                continue;
            }
            categoryList.push({
                id: category.code,
                name: allowedTypesIndex[category.code].label
            });
            var optionGroup = [];
            //Build the option groups
            for (var i = 0; i < category.categories.length; i++) {
                var group = category.categories[i];
                //Build the option groups
                for (var j = 0; j < group.subcategories.length; j++) {
                    var item = group.subcategories[j];
                    optionGroup.push(Ember.Object.create(
                        {
                            id: item.id,
                            name: item.name,
                            group: group.name,
                            order: group.termOrder,
                            childOrder: item.termOrder
                        }
                    ));
                }
            }
            categoryListIndex[category.code] = optionGroup;
        }
        //If there are chapters add Nursing Topics category
        if(chaptersData.length) {
            categoryList.push({
                id: SakuraiWebapp.Section.NURSING_TOPICS,
                name: I18n.t(SakuraiWebapp.Section.NURSING_TOPICS, {count: 2}).replace(/(^| )(\w)/g, function (x) {
                    return x.toUpperCase();
                })
            });
            categoryListIndex[SakuraiWebapp.Section.NURSING_TOPICS] =
                controller.get("chapterList");
        }
        controller.set("categoryList", categoryList);
        controller.set("categoryListIndex", categoryListIndex);
        //If no categoryId query parameter is provided clear the ids
        if(!controller.get("categoryId")) {
            controller.set("currentCategory", null);
            controller.set("currentSubcategory", null);
            controller.set("currentChapter", null);
        }
        //If we have more than one category we will use two drop-downs
        if(controller.get("isCategoryEnabled")) {
            //Two drop-downs
            controller.set("chapterId", null);
        } else {
            //Set the categoryId value. We should have zero or one item in categoryList
            if(categoryList.length == 1) {
                controller.set("categoryId", categoryList[0].id);
                controller.set("currentCategory", categoryList[0].id);
                controller.set("chapterList", categoryListIndex[categoryList[0].id]);
            }
            controller.set("subcategoryId", null);
        }

        this.loadQCQuizzes(controller, model);
    },

    loadQCQuizzes: function(controller, model) {
        var self = this,
            store = controller.store,
            classId = model.clazz.get("id");

        store.query("quiz", {classId:classId, studentId: model.studentId, type: 'question_collection', currentPage: 1, pageSize:10, sort:"startedOn", direction:"DESC"}) //Load Question Collection Quizzes
            .then(function(quizzesQC){ //display qc quizzes
                self.loadRRQuizzes(controller, model);
                controller.set("quizzesQC", quizzesQC);
                if (quizzesQC.content.get("length")!=0){
                    var store = controller.store;
                    controller.updateMetadata(quizzesQC.get('meta'), "metadataQC");
                    controller.setPagination("QC");
                }
            });
    },

    loadRRQuizzes: function(controller, model) {
        var store = controller.store,
            classId = model.clazz.get("id");

        store.query("quiz", {classId:classId, studentId: model.studentId, type: 'review_refresh', currentPage: 1, pageSize:10, sort:"startedOn", direction:"DESC"}) //Load Question Collection Quizzes
            .then(function(quizzesRR){ //display qc quizzes
                controller.set("quizzesRR", quizzesRR);
                if (quizzesRR.content.get("length")!=0){
                    var store = controller.store;
                    controller.updateMetadata(quizzesRR.get('meta'), "metadataRR");
                    controller.setPagination("RR");
                }
            });
    }

});
