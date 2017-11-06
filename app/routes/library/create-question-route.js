import Route from '@ember/routing/route';
import Ember from "ember";
import ResetScroll from "mixins/reset-scroll";

export default Route.extend(
    ResetScroll,{

	model: function(params) {
        var store = this.store;

        return Ember.RSVP.hash({
            class : store.find("class", params.classId),
            question: (params.questionId !== "0") ? store.find("question", params.questionId) : undefined,
            params: params
        });
	},

    afterModel:function(model){
        var store = this.store,
            self = this;

        return model.class.get('product').then(function(product) {
            return Ember.RSVP.hash({
                learningObjectives: store.query("learningObjective", { productId: product.get("id")}),
                products: (self.get('isAuthoringEnabled')) ? store.query("product", { subjectId: product.get('subject')}) : [],
                subjects: (self.get('isAuthoringEnabled')) ? store.query("subject", { publisherName: 'LWW'}).then(function(data){
                    model.allProducts = store.findAll('product');
                    model.allSections = store.findAll('section');
                    model.allLO = store.findAll('learningObjective');
                    return data;

                }) : [],
                isRemediationLinkAllowed: product.get("isRemediationLinkAllowed") && self.get('isAuthoringEnabled')
            }).then(function(hash){
                    model.learningObjectives = hash.learningObjectives;
                    model.products = hash.products;
                    model.subjects = hash.subjects;
                    model.isRemediationLinkAllowed = hash.isRemediationLinkAllowed;
            });
        });
    },


	setupController: function(controller, model) {

        controller.set('class', model.class);
        controller.set('learningObjectives', model.learningObjectives);

        controller.set('isCreating', !(+model.params.questionId));
        controller.set('questionProducts', model.products);
        controller.set('isRemediationLinkAllowed', model.isRemediationLinkAllowed);
        controller.set('subjects', model.subjects);
        controller.set('allProducts', model.allProducts);
        controller.set('allSections', model.allSections);
        controller.set('allLO', model.allLO);
        controller.initQuestion(model.question);

	}

});
