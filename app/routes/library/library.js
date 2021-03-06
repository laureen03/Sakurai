
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import TermTaxonomy from "sakurai-webapp/models/term-taxonomy";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
    ResetScroll,{

    model: function(params, transition) {
        var store = this.store;
        var classId = transition.params[transition.targetName].classId;

        var authenticationManager = context.get('authenticationManager');
        authenticationManager.setImpersonatedUser(false);
        var user = authenticationManager.getCurrentUser();

        return new Ember.RSVP.Promise(function(resolve, reject){
            store.find("class", classId).then(function(clazz){
                clazz.get("product").then(function(product){
                    var hashObject = {
                        class : clazz,
                        product: product,
                        sections : store.query("section", { classId: classId }),
                        questionSets : store.query("questionSet", {"userId": user.get("id"), "productId": product.get("id")}),
                        authors: (user.get("isAdmin")) ? store.query("user",{productId: product.get("id"), authors: 1}) : undefined,
                        otherProducts: (user.get("isAdmin")) ? store.query("product", {questionsAppearingProductId: product.get("id")}) : undefined
                    };

                    hashObject.defaultDataType =  product.get('defaultDataType');
                    hashObject.termTaxonomies = store.query("termTaxonomy", {'productId': product.get("id")});

                    //Check if taxonomy tag exist
                    var taxonomyTag = authenticationManager.get("taxonomyTag");
                    if (taxonomyTag){
                        hashObject.termTaxonomiesConcepts = store.find("termTaxonomy", {'taxonomyTag': taxonomyTag});
                    }

                    Ember.RSVP.hash(hashObject).then(function(hash){
                            resolve(hash);
                    }, reject);
                });
            }, reject);
        });

    },

    setupController: function(controller, model) {
        var qcTotal;

        controller.set("class", model.class);
        controller.set("sections", model.sections);
        controller.set("questionSets", model.questionSets);
        controller.set("product", model.product);
        controller.set("defaultDataType", model.product.get('defaultDataType'));
        controller.set("allTermTaxonomies", model.termTaxonomies);
        controller.set("termTaxonomiesConcepts", model.termTaxonomiesConcepts);
        controller.set("authors", (model.authors) ? model.authors.sortBy('lastName') : null);
        controller.set("otherProducts", (model.otherProducts) ? model.otherProducts.sortBy('name'): null);
        var questionSetMetadata = controller.questionSets.get('meta');
        if (questionSetMetadata.totalCreatedQuestions){
            controller.set("totalCreatedQuestions", parseInt(questionSetMetadata.totalCreatedQuestions));
        }

        qcTotal = questionSetMetadata.questionSetsEnabledForCurrentSubject;
        qcTotal = (qcTotal && typeof parseInt(qcTotal) === 'number') ? parseInt(qcTotal) : 0;
        controller.set("questionSetsEnabledForCurrentSubject", qcTotal);
    },

    actions: {
        openTaxonomyModal: function(type, label) {
            var libraryController = this.controllerFor('library');
            var authenticationManager = context.get('authenticationManager');
            var allTermTaxonomies = libraryController.get("allTermTaxonomies");
            var filteredByType = TermTaxonomy.filterByType(allTermTaxonomies, type);
            //Check if taxonomy tag exist
            var treeTaxonomies = null;
            var taxonomyTag = authenticationManager.get("taxonomyTag");
            if (TermTaxonomy.isConcepts(type) && (taxonomyTag)) {
                var termTaxonomiesConcepts = libraryController.get("termTaxonomiesConcepts");
                filteredByType = TermTaxonomy.filterByType(termTaxonomiesConcepts, type);
                treeTaxonomies = TermTaxonomy.convertTaxonomyTagToTree(filteredByType);
            } else if (type === TermTaxonomy.BLOOM_TAXONOMY) {
                treeTaxonomies = TermTaxonomy.convertBloomsToTree(filteredByType);
            } else {
                treeTaxonomies = TermTaxonomy.convertToTree(filteredByType, type);
            }

            libraryController.set("termTaxonomies", treeTaxonomies);
            libraryController.set('taxonomyModalTitle', I18n.t('questionLibrary.filter.filteringBy') + ' ' + label);
            libraryController.set('taxonomyModalType', type);
        }
    }
});
