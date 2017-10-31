import DS from 'ember-data';
import Ember from "ember";
import Question from "../models/question";
import Context from '../utils/context-utils';

export default DS.Model.extend({
    questionText: DS.attr('string'),
    mediaType: DS.attr('string'),
    questionMedia: DS.attr('string'),

    /**
     * @property {QuestionFilter[]} Array of question filter IDs
     */
    questionFilters: DS.hasMany('questionFilter', { async: true }),

    interactions: DS.attr(), /* type, shuffle, minChoices, maxChoices, expectedLength, label, prompt, answerChoices, tools */
    feedbacks: DS.attr(),
    references: DS.attr(),  // [ {id: number, text: string} ... ]

    //@TODO check if this variable is used
    correctResponses: DS.attr(),
    difficulty: DS.attr('number'),
    order: DS.attr('number'),
    
    /**
     * @property {string} question status (e.g. "active", "retired", etc)
     */
    status: DS.attr('string'),

    /**
     * @property {bool} is the question hidden or uncorrelated for a specific product?
     */
    unassociated: DS.attr('boolean'),

    /**
     * @property {number}
     */
    answerCount: DS.attr('number'),

    /**
     * @property {number} if doing a major edit on a question, this will be the id of the original question.
     */
    referenceQuestionId: DS.attr('number'),

    /**
     * @property {Product} Product of the class
     */
    product: DS.belongsTo('product', { async: true }),

    /**
     * @property {SakuraiWebapp.User} Instructor who created this question
     * This field makes it easy to query for all questions
     * (instructor === undefined) -in the case of an author- or
     * all questions created by a specific instructor
     */
    instructor: DS.belongsTo('user', { async: true }),

    /**
     * @property {SakuraiWebapp.User} User with 'admin' role who created this question.
     * If the user who created the question was an instructor, then the value of
     * this property will be undefined. This field (as opposed to @see instructor) is
     * helpful for determining in the BE all the authors for a specific product
     */
    author: DS.belongsTo('user', { async: true }),

    /**
     * @property {SakuraiWebapp.TermTaxonomy[]}
     */
    termTaxonomies: DS.hasMany('termTaxonomy', { async: true }),

    /**
     * @property {SakuraiWebapp.LearningObjective[]}
     */
    learningObjectives: DS.hasMany('learningObjective', { async: true }),

    /**
     * @property {SakuraiWebapp.Chapter[]}
     */
    sections: DS.hasMany('section', { async: true }),

    /**
     * @property {SakuraiWebapp.RemediationLink[]}
     */
    remediationLinks: DS.hasMany('remediationLink', { async: true }),

    /**
     * @property {number} misconception rating
     */
    misconceptionRating: DS.attr('number'),

    /**
     * @property {number} class misconception rating
     */
    classMisconceptionRating: DS.attr('number'),

    /**
     * Question family
     * Some question belong to the same family
     * @property {number}
     */
    parentId: DS.attr('number'),

    /**
     * Indicates if this question is a variant
     * This is only used when creating a question
     * @property {bool}
     */
    hasVariant: DS.attr('boolean'),

    /**
     * @property {SakuraiWebapp.Subject[]}
     */
    subjects: DS.hasMany('subject', { async: true }),

    allProducts: DS.attr(),

    /**
     * @property {SakuraiWebapp.Product[]}
     */
    products: DS.hasMany('product', { async: true }),

    /**
     * @property {SakuraiWebapp.Subject[]}
     */
    subjectsOfProducts: DS.hasMany('subject', { async: true }),

    /**
     * Has Feedbacks
     * @property {bool}
     * Flag that indicates if a question has or not feedbacks
     */
    hasFeedback: Ember.computed.bool('feedbacks.length'),

    /**
     * @property {bool} does the question have a status of "retired" or "on hold"?
     */
    isInactive: Ember.computed('status', function(){
        var status = this.get('status');
        return (status === Question.RETIRED || status === Question.ON_HOLD);
    }),

    /**
     * Indicates if the question is retired
     * @property {bool}
     */
    retired: Ember.computed('status', function(){
        return (this.get('status') === Question.RETIRED);
    }),

    /**
     * Indicates if the question is on hold
     * @property {bool}
     */
    onHold: Ember.computed('status', function(){
        return (this.get('status') === Question.ON_HOLD);
    }),

    /**
     * Indicates if the question is active
     * @property {bool}
     */
    active: Ember.computed('status', function(){
        return (this.get('status') === Question.ACTIVE);
    }),

    /**
     * Indicates if the question is calibrating
     * @property {bool}
     */
    calibrating: Ember.computed('status', function(){
        return (this.get('status') === Question.CALIBRATING);
    }),

    /**
     * Indicates if the calibrating image needs to be display
     */
    showCalibrating: Ember.computed("calibrating", "difficulty", function(){
        return this.get('calibrating') ||
            (this.get("difficulty")) === null || (this.get("difficulty") === 0 && !this.get("active"));
    }),

    /**
     * Indicates if the question is available
     */
    available: Ember.computed('status', function(){
        return this.get("active") || this.get("calibrating");
    }),

    isUnassociated: Ember.computed('unassociated', 'isInactive', function(){
        var unassociated = this.get('unassociated'),
            isInactive = this.get('isInactive');
        return (unassociated && !isInactive);
    }),

    groupedProducts: Ember.computed("products.[]", "subjectsOfProducts.[]", function(){
        var result = [];
        var groupedResult = [];
        this.get('products').forEach(function(item){
            var hasSubject = result.findBy('subjectId', item.get('subject'));
            if(!hasSubject) {
                result.pushObject(Ember.Object.create({subjectId: item.get('subject'), contents: []}));
            }
            result.findBy('subjectId', item.get('subject')).get('contents').pushObject(item);
        });
        this.get('subjectsOfProducts').forEach(function(item){
            var tempSub = result.findBy('subjectId', parseInt(item.id));
            if(tempSub) {
                groupedResult.pushObject(Ember.Object.create({subject: item,
                                                         contents: tempSub.get('contents')}));
            }
        });
        return groupedResult;
    }),

    showProducts: Ember.computed("products.[]", function(){
        return this.get('products').get('length') > 1;
    }),

    /**
     * Retrieves the correct response
     * @returns {{ id: {number}, value: {array}, ordered: {boolean}}}
     */
    correctResponse: Ember.computed("interactions.[]", function(){
        var interactions = this.get('interactions');
        return (interactions && interactions.length) ?
            interactions[0].correctResponse : null;
    }),

    /**
     * Get the tool list available for the question (e.g. calculator)
     * @returns {array}
     */
    tools: Ember.computed("interactions.[]", function(){
        var interactions = this.get('interactions');
        return (interactions && interactions.length) ? interactions[0].tools : [];
    }),

    /**
     * Retrieves the question type
     * @returns {string}
     */
    questionType: Ember.computed('interactions.[]', function(){
        var interactions = this.get('interactions');
        return (interactions && interactions.length) ?
            interactions[0].subType : null;
    }),

    answerString: Ember.computed('interactions', function(){

        var interactions = this.get('interactions'),
            keyCodeA = 65,
            result, answerChoices, answers;
        if (interactions) {
            interactions = interactions[0];
            result = [];
            answerChoices = interactions.answerChoices;
            answers = interactions.correctResponse.value;
            if ((this.get("isHotSpot")) || (this.get("isFillInBlank"))){
                return answers;
            }else{
                answerChoices.forEach( function (answerChoice, index) {
                    var pos = $.inArray(answerChoice.id, answers);

                    if (pos > -1) {
                        // Get the corresponding answer character (A, B, C, etc.)
                        // based on the position of the answer choice in the
                        // answerChoices array
                        result.push(String.fromCharCode(keyCodeA + index));
                    }
                });

                return result.join(', ');
            }
        } else {
            return '';
        }

    }),

    /**
    * @property {Boolean} is this a drag and drop question
    **/
    isDragNDrop: Ember.computed('questionType', function(){
        return this.get('questionType') === Question.DRAG_AND_DROP;
    }),

    /**
    * @property {Boolean} Return True or False if is a Select Point Question
    **/
    isHotSpot: Ember.computed('interactions', function(){
        return this.get('questionType') === Question.HOT_SPOT;
    }),

    /**
    * @property {Boolean} is this a drag and drop question
    **/
    isFillInBlank: Ember.computed('questionType', function(){
        return this.get('questionType') === Question.FILL_IN_THE_BLANK;
    }),

    /**
     * Indicates when a question is a misconception
     * @returns {boolean}
     */
    isMisconception: Ember.computed('misconceptionRating', function(){
        return this.get("misconceptionRating") > 55;
    }),

    /**
     * Indicates when a question is a misconception
     * @returns {boolean}
     */
    isClassMisconception: Ember.computed('classMisconceptionRating', function(){
        return this.get("classMisconceptionRating") > 55;
    }),

    /**
    * Indicates when a question is private reserve
    * @returns {boolean}
    */
    isPrivateReserve: Ember.computed('questionFilters.[]', function(){
        var qf = this.get("questionFilters");
        var result = false;
        qf.forEach( function (questionFilter) {
            if(questionFilter.get("isPrivate")) {
                result = true;
            }
        });
        
        return result;
    }),

    /**
     * Parsed references
     * @property {array} [ { id: number, text: string, hasRemediationLink: bool, page: string }... ]
     */
    parsedReferences: Ember.computed('sections.[]', function(){
        var question = this;

        return this.get("sections").then(function(sections){
            return Question.parseReferences(question, sections);
        });
    }),

    /**
     * Parsed references
     * @property {array} [ { id: number, text: string }... ]
     */
    legacyReferences: Ember.computed('sections.[]', function(){
        var question = this;

        return this.get("sections").then(function(sections){
            return Question.legacyReferences(question, sections);
        });
    }),

    /**
     * hasProductClassPercentage
     * @property {bool}
     * Flag that indicates if the question has class answer choice
     */
    hasProductClassPercentage: Ember.computed('interactions', function(){
        var interactions = this.get('interactions');
        return (interactions  &&
                 interactions.length > 0 &&
                 interactions[0].classAnswerChoicesPercentages &&
                 interactions[0].classAnswerChoicesPercentages.length > 0);
    })

});

/**
 * Adds convenience methods to the Question model
 */
Question.reopenClass({

    CHOICE: "choice", //question type for choice, includes sub types MC, CM and GO

    // question sub types
    MULTIPLE_CHOICE : 'multiple_choice', //this is used for single answer selection
    CHOICE_MULTIPLE : 'choice_multiple', //this is used for multiple answer selection
    GRAPHIC_OPTION : 'graphic_option',
    FILL_IN_THE_BLANK : 'fill_in_the_blank',
    AUDIO_VIDEO : 'audio_video',
    HOT_SPOT : 'hot_spot',
    DRAG_AND_DROP : 'drag_and_drop',

    /** statuses */
    ON_HOLD : "on_hold",
    ACTIVE : "active",
    CALIBRATING : "calibrating",
    RETIRED : "retired",

    TOOLS : {
        CALCULATOR: 'calculator'
    },

    /**
     * Shuffles the given answer choices
     * @param answerChoices
     * @returns {Array}
     */
    shuffle: function(answerChoices){
        //+ Jonas Raoni Soares Silva
        //@ http://jsfromhell.com/array/shuffle [v1.0]
        var shuffle = function(o){ //v1.0
            for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){
                return o;
            }
        };

        return shuffle(answerChoices);
    },

    /**
     * Orders the answer choices following the specification
     * @param answerChoices
     * @returns {Array}
     */
    order: function(answerChoices){
        var setAtAvailablePosition = function(choicesArray, choice){
            for (var k = 0; k < choicesArray.length; k++){
                if(choicesArray[k] === false){
                    choicesArray[k] = choice;
                    break;
                }
            }
        };

        var newChoices = [],
            areAllFixedPosition = true,
            orderPriorities = [];

        for (var i = 0; i < answerChoices.length; i++){
            newChoices[i] = false;
            if(!answerChoices[i].fixed){
                areAllFixedPosition = false;
            }
            var orderPriority = answerChoices[i].orderPriority;
            if($.inArray(orderPriority, orderPriorities) < 0) {
                orderPriorities.push(orderPriority);
            }
        }
        orderPriorities.sort();
        // all are fixed so just sort by priority and return and return
        if(areAllFixedPosition){
            newChoices = answerChoices.sort(function(a, b){
                if(a.orderPriority === undefined && b.orderPriority === undefined){
                    return 0; // no priority so equal
                }
                if(a.orderPriority === undefined){
                    return -1; // a has none so same as a < b
                }
                if(b.orderPriority === undefined){
                    return 1; // b has none so same as a > b
                }
                if (a.orderPriority > b.orderPriority) {
                    return 1;
                }
                if (a.orderPriority < b.orderPriority) {
                    return -1;
                }
                return 0;
            });
        }
        else{
            for (i = 0; i < answerChoices.length; i++){
                var choice = answerChoices[i];
                if (choice.fixed){
                    var priority = choice.orderPriority === undefined ? i : orderPriorities.indexOf(choice.orderPriority);
                    var choiceAtOrderPriority = newChoices[priority];
                    if (choiceAtOrderPriority !== false){ //if taken, look for available space
                        setAtAvailablePosition(newChoices, choiceAtOrderPriority);
                    }
                    newChoices[priority] = choice;
                }
                else{
                    var choiceAtIndex = newChoices[i];
                    if (choiceAtIndex === false){ //if not taken
                        newChoices[i] = choice;
                    }
                    else{ //if taken, look for available space
                        setAtAvailablePosition(newChoices, choice);
                    }
                }
            }
        }

        return newChoices;
    },

    /**
     * Copies a question record into a new record
     * @param {Ember.DS.Store} store
     * @param {Question} question
     * @returns {Em.RSVP.Promise}
     */
    copyQuestionRecord: function(store, question){
        return new Ember.RSVP.Promise(function (resolve) {
            Ember.RSVP.hash({
                feedbacks: question.get('feedbacks'),
                interactions: question.get('interactions'),
                learningObjectives: question.get('learningObjectives'),
                references: question.get('references'),
                remediationLinks: question.get('remediationLinks'),
                questionFilters: question.get('questionFilters'),
                sections: question.get('sections'),
                termTaxonomies: question.get('termTaxonomies')
            }).then(function (hash) {

                // By default, questions created off a major edit have a status of 'on_hold'
                var newQuestion = store.createRecord("question", {
                    questionText: question.get('questionText'),
                    referenceQuestionId: question.get('id'),
                    parentId: question.get("id")
                });

                newQuestion.set('feedbacks', hash.feedbacks);
                newQuestion.set('interactions', hash.interactions);
                newQuestion.set('references', hash.references);

                // Special care must be taken when setting the values for the hasMany relationships:
                // http://stackoverflow.com/questions/24184706/ember-hash-createrecord-with-hasmany-relationship-without-saving
                // http://stackoverflow.com/questions/20961354/pushobject-to-parent-in-has-many-relationshop
                Ember.RSVP.all([
                    newQuestion.get('learningObjectives'),
                    newQuestion.get('remediationLinks'),
                    newQuestion.get('sections'),
                    newQuestion.get('termTaxonomies')
                ]).then(function () {
                        newQuestion.get('learningObjectives').setObjects(hash.learningObjectives);
                        newQuestion.get('remediationLinks').setObjects(hash.remediationLinks);
                        newQuestion.get('sections').setObjects(hash.sections);
                        newQuestion.get('termTaxonomies').setObjects(hash.termTaxonomies);
                        resolve(newQuestion);
                });
            });
        });
    },


    /**
     * Convenience method to return legacy reference text
     * @param {Question} question
     * @param {SakuraiWebapp.Chapter[]} sections
     * @return {Ember.RSVP.Promise} resolves [ { id: number, text: string }... ]
     */
  legacyReferences: function(question){
        var references = question.get("references") || [];
        return references;
    },


    /**
     * Convenience method to parse reference text
     * @param {Question} question
     * @param {SakuraiWebapp.Chapter[]} sections
     * @return {Ember.RSVP.Promise} resolves [ { id: number, text: string, hasRemediationLink: bool, page: string, sectionText: string }... ]
     */
  parseReferences: function(question, sections){
        var context = Context;
        var lwwProperties = context.get("environment").getProperty("lww");
        var thePointUrl = lwwProperties.baseUrl + lwwProperties.referenceUrlPath;
        var isbn = context.get("authenticationManager").get("isbn");

        var references = question.get("references") || [];
        var products = question.get('products') || [];
        var regex = /p\.+ ([0-9]+[-+[0-9]*)\.$/; // regex for  “p. NUMBER.” or “pp. NUMBER-NUMBER.”
        $.each(references, function(index, reference){
            var text = $.trim(reference.text);
            var pageNumber = $.trim(reference.pageNumber);
            var secondaryInfo = $.trim(reference.secondaryInfo);
            var info = regex.exec(text);
            var sectionName = "";
            if (info || pageNumber){
                var section = (sections.get("length")) ? sections.get("firstObject") : null;
                if (section){
                    sectionName = section.get("name");
                    //use section isbn if available, otherwise use the product isbn
                    isbn = section.get("isbn") || isbn;
                }else{
                    var infoName = text.match(/Chapter\s([0-9]+[-+[0-9]*)(.*)p\.\s([0-9]+[-+[0-9]*)/);
                    if (infoName){
                        sectionName = infoName[0].trim();
                        sectionName = sectionName.substring(0, sectionName.lastIndexOf(","));
                    }
                }
                var pageInfo = info ? info[1] : pageNumber;
                reference.hasRemediationLink = true;
                reference.page = pageInfo.split("-")[0]; //has a value like "22" or "33-40"
                reference.url = (thePointUrl + isbn + "/page/" + reference.page);
                reference.sectionText = sectionName + " - Page " + pageInfo;
            }
            if (reference.product && !text) {
                var product = products.findBy("id", String(reference.product));
                if (product && product.get("publicationFacts")) {
                    reference.text += product.get('formattedPublication');
                    if(sectionName){
                        reference.text += ', ' + sectionName;
                    }
                    if(secondaryInfo){
                        reference.text += ', ' + secondaryInfo;
                    }
                    if(pageNumber){
                        reference.text += ', ' + (pageNumber.split("-").length > 1 ? 'pp. ' : 'p. ') + pageNumber;
                    }
                    reference.text += '.';
                }
            }
        });
        // add product publication as default reference for the question if none found
        products.forEach(function(item){
            var reference = references.findBy("product", parseInt(item.id));
            if(!reference && item.get("publicationFacts")) {
                var section = (sections.get("length")) ? sections.get("firstObject") : null;
                var defaultRef = Ember.Object.create({text: '', product: item.id});
                var defaultText = item.get('formattedPublication');
                if (section){
                    var sectionName = section.get("name");
                    if(sectionName){
                        defaultText += ', ' + sectionName;
                    }
                }
                defaultText += '.';
                defaultRef.set('text', defaultText);
                references.push(defaultRef);
            }
        });
        return references;
    },

    /**
     * Changes question status
     * @param store
     * @param question
     * @param status
     */
    changeQuestionStatus: function(store, question, status){
        return new Ember.RSVP.Promise(function(resolve, reject){
            /*
             NOTE: if there is more work related to updating the data for a question
             it will be best to create a model and an adapter for it, like AuthKey
             For now it is just too much work for a single request
             */
            var url = Context.getBaseUrl() + "/questions/updateStatus";
            var data = { questionId: question.get("id"), status: status };

            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: data,
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });
    },

    /**
     * Retrieve the possible sort options
     * @param {bool} authoringEnabled
     */
    getSortOptions: function(authoringEnabled){
        var sortOptions = [
            {id: 1, label: I18n.t('questionLibrary.easiest'), sort: "difficulty", direction: "ASC"},
            {id: 2, label: I18n.t("questionLibrary.hardest"), sort: "difficulty", direction: "DESC"},
            {id: 3, label: I18n.t("questionLibrary.misconceptionAlert"), sort: "misconceptionRating", direction: "DESC"},
            {id: 4, label: I18n.t("questionLibrary.privateReserve"), sort: "questionFilters", direction: "DESC"},
            {id: 5, label: I18n.t("questionLibrary.questionWithImages"), sort: "images", direction: "DESC"},
        ];

        if (authoringEnabled){
            sortOptions.push({id: 6, label: I18n.t('questionLibrary.questionId'), sort: "id", direction: "DESC"});
            sortOptions.push({id: 7, label: I18n.t('questionLibrary.timesAnswered'), sort: "answerCount", direction: "DESC"});
        }

        return sortOptions;
    },

    /**
     * Gets class misconceptions
     * @param store
     * @param {number} classId
     * @param {number} productId
     * @returns {Question[]}
     */
    getClassMisconceptions: function(store, classId, productId){
        return store.query("question", {
            classMisconception: classId,
            productId: productId,
            currentPage: 1,
            direction: 'DESC',
            pageSize: 5 });
    },

    /**
     * Returns an object with question types, labels and descriptions
     * @returns {[ {type: string, label: string, desc: string}]}
     */
    questionTypes: function(){
        return [
            {
                type: Question.MULTIPLE_CHOICE,
                label: I18n.t('common.questionTypes.multipleChoice'),
                desc: ""
            },
            {
                type: Question.CHOICE_MULTIPLE,
                label: I18n.t('common.questionTypes.choiceMultiple'),
                desc: I18n.t('common.questionTypes.choiceMultipleDesc')
            },
            {
                type: Question.FILL_IN_THE_BLANK,
                label: I18n.t('common.questionTypes.textEntryWithNumber'),
                desc: ""
            },
            {
                type: Question.GRAPHIC_OPTION,
                label: I18n.t('common.questionTypes.graphicOption'),
                desc: I18n.t('common.questionTypes.graphicOptionDesc')
            },
            {
                type: Question.HOT_SPOT,
                label: I18n.t('common.questionTypes.hotSpot'),
                desc: I18n.t('common.questionTypes.hotSpotDesc')
            },
            {
                type: Question.DRAG_AND_DROP,
                label: I18n.t('common.questionTypes.dragDrop'),
                desc: I18n.t('common.questionTypes.dragDropDesc')
            }
        ];
    },

    /**
     * Returns an object with question status, labels
     * @returns {[ {type: string, label: string}]}
     */
    questionStatuses: function(){
        return [
            {
                type: Question.ACTIVE,
                label: I18n.t('active')
            },
            {
                type: Question.CALIBRATING,
                label: I18n.t('calibrating')
            },
            {
                type: Question.ON_HOLD,
                label: I18n.t('on_hold')
            },
            {
                type: Question.RETIRED,
                label: I18n.t('retired')
            }
        ];
    },

    /**
     * Update Question Family Request
     * @param store
     * @param questionId
     * @param parentId
     */
    updateFamily: function(store, questionId, parentId){
        return new Ember.RSVP.Promise(function(resolve, reject){
            var url = Context.getBaseUrl() + "/questions/updateParent";
            var data = { questionId: questionId, parentId: parentId };

            Ember.$.ajax(url, {
                method: 'GET',
                contentType: 'application/json',
                data: data,
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });
    },

});
