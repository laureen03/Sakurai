/*global Ember*/
import DS from 'ember-data';
import TermTaxonomy from "sakurai-webapp/models/term-taxonomy";

export default DS.Model.extend({
    weaknesses: DS.hasMany('termTaxonomyPerformance', { async: true }),
    strengths: DS.hasMany('termTaxonomyPerformance', { async: true }),
    termTaxonomyPerformances: DS.hasMany('termTaxonomyPerformance', { async: true }),

    /**
     * Standard method to get the performances, so it is compliant with ChapterStats
     * This is used in some components
     * @property {TermTaxonomyPerformance[]}
     */
    performances: Ember.computed('termTaxonomyPerformances.[]', function(){
        return this.get("termTaxonomyPerformances");
    }),


    // It may be possible to delete these methods if they were not used
    // by the haid-performance-bars component anymore

    //-------------------------------------------------
    //     T A X O N O M Y   P E R F O R M A N C E
    //-------------------------------------------------
    nursingTaxonomyPerformances: Ember.computed('termTaxonomyPerformances.[]', function(){ //Returns only Nursing Concepts
        return this.performancesByType(TermTaxonomy.NURSING_CONCEPTS);
    }),

    clientNeedsTaxonomyPerformances: Ember.computed('termTaxonomyPerformances.[]', function(){ //Returns only Client needs
        return this.performancesByType(TermTaxonomy.CLIENT_NEEDS);
    }),

    //-------------------------------------------------
    //              W E A K N E S S E S
    //-------------------------------------------------
    nursingConceptsWeaknesses: Ember.computed('weaknesses.[]', function(){ //Returns only Nursing Concepts
        return this.weaknessesByType(TermTaxonomy.NURSING_CONCEPTS);
    }),

    clientNeedsWeaknesses: Ember.computed('weaknesses.[]', function(){ //Returns only Client needs
        return this.weaknessesByType(TermTaxonomy.CLIENT_NEEDS);
    }),

    //-------------------------------------------------
    //               S T R E N G T H S
    //-------------------------------------------------
    nursingConceptsStrengths: Ember.computed('strengths.[]', function(){ //Returns only Nursing Concepts
        return this.strengthsByType(TermTaxonomy.NURSING_CONCEPTS);
    }),

    clientNeedsStrengths: Ember.computed('strengths.[]', function(){ //Returns only Client needs
        return this.strengthsByType(TermTaxonomy.CLIENT_NEEDS);
    }),

    /**
     * Returns the strengths by type
     * @param {string} type
     * @returns {Ember.A}
     */
    strengthsByType: function(type){ //Returns only strengths by type
        return this.filterByType("strengths", type);
    },

    /**
     * Returns the weaknesses by type
     * @param {string} type
     * @returns {Ember.A}
     */
    weaknessesByType: function(type){ //Returns only strengths by type
        return this.filterByType("weaknesses", type);
    },

    /**
     * Filters the taxonomies by type
     * @param {string} type
     * @returns {Ember.A}
     */
    performancesByType: function(type){
        return this.filterByType("termTaxonomyPerformances", type);
    },

    /**
     * Filters the list per type
     * @param {string} listProperty
     * @param {string} type
     * @returns {Ember.A}
     */
    filterByType: function(listProperty, type){
        var filterCallback = function(termTaxonomyPerformance){
            return (termTaxonomyPerformance.isType(type));
        };
        return this.filterList(listProperty, filterCallback);
    },

    /**
     * Returns an filtered array from 'listProperty' filtered by the 'filter'
     * Usage: this.filterList("isClientNeeds", function(item, i){ ... }, "termTaxonomy")
     *
     * @param {string} listProperty the property name to get the list
     * @param {function} filterCallback the function to call when filtering the list
     * @return {Ember.A} filtered listProperty
     *
     */
    filterList: function(listProperty, filterCallback){
        var model = this;
        return DS.PromiseArray.create({
            promise: new Ember.RSVP.Promise(function (resolve) {
                var arrayToFilter = model.get(listProperty);
                arrayToFilter.then(function (arrayToFilter) {
                    //resolves the properties for each item before filtering the list
                    var promises = arrayToFilter.map(function(item){
                        // the method #isType in the filterCallback assumes that the termTaxonomy
                        // of the corresponding termTaxonomyPerformance has already been loaded
                        // so we need to ask for it beforehand
                        return item.get("termTaxonomy");
                    });

                    Ember.RSVP.all(promises).then(function () {
                        var filtered = arrayToFilter.filter(filterCallback);
                        resolve(filtered);
                    });
                });
            })
        });
    }
});
