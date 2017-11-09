/**
 * Component for displaying a list of question collections within a modal window
 *
 * @extends Ember.Component
 *
 * @param component-class {string} special class to add to the component's tag (optional)
 * @param is-visible {bool} should the modal be visible or hidden?
 * @param question-collections {QuestionSet[]} array of question sets
 * @param exclude-product {number} Product ID. Question collections that belong to this product should be excluded
 *                                 from the displayed list (optional)
 * @param on-name-click {string} name of action to send to the target when clicking on a question set name
 */

import Ember from "ember"; 

export default Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['import-question-sets-modal', 'modal', 'fade'],
    classNameBindings: ['component-class'],

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    filteredProducts: null,

    /*
     * === Methods ===
     */
    didInsertElement: function() {
        var self = this;

        // Add event listener
        this.$().on('hidden.bs.modal', function() {

            Ember.run( function() {

                // Reset modal content
                self.set('is-visible', false);
                self.set('question-collections', null);
                self.set('filteredProducts', null);
            });
        });
    },

    willDestroyElement: function() {
        this.$().off('hidden.bs.modal');
    },

    /*
     * === Observers ===
     */
    controlVisibility: Ember.observer('is-visible', function() {
        if (this.get('is-visible')) {
            this.$().modal("show");
        } else {
            this.$().modal("hide");
        }
    }),

    filterData: Ember.observer('question-collections', function() {
        var questionCollections = this.get('question-collections'),
            excludeProduct = this.get('exclude-product'),
            self = this;

        if (questionCollections && questionCollections.get('length')) {
            questionCollections = questionCollections.filter( function(qc){
                    // Filter out question sets with no questions
                    return qc.get('totalQuestions') > 0;
                }).map( function(qc) {
                    return new Ember.RSVP.Promise( function(resolve) {
                        qc.get('product').then( function(product) {
                            // Get only what is needed from each question collection
                            resolve({
                                product: product,
                                questionCollection: {
                                    id: qc.get('id'),
                                    name: qc.get('name'),
                                    totalQuestions: qc.get('totalQuestions')
                                }
                            });
                        });
                    });
                });

            Ember.RSVP.all(questionCollections).then( function(questionCollections) {
                var productsObject = {},
                    productsArray = Ember.ArrayProxy.create({ content: Ember.A()}),
                    productId;

                questionCollections.forEach( function(qc) {
                    var productId = qc.product.get('id');

                    if (productId !== excludeProduct) {

                        // Has the product id already been added?
                        if (!productsObject[productId]) {
                            productsObject[productId] = {
                                name: qc.product.get('name'),
                                filteredQuestionSets: []
                            };
                        }
                        // Group all the question collections by productId
                        productsObject[productId].filteredQuestionSets.push(qc.questionCollection);
                    }
                });

                for (productId in productsObject) {
                    // Transform the object into an array (to be consumed by the template)
                    productsArray.pushObject(productsObject[productId]);
                }

                self.set('filteredProducts', productsArray);
            });
        }
    }),

    actions: {

        doImport: function(questionSetId) {
            Ember.Logger.debug(this.toString() + ': importing question set with ID: ', questionSetId);
            // Hide the modal
            this.$().modal("hide");

            // Send event to target
            this.sendAction('on-name-click', questionSetId);
        }
    }

});
