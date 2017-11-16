
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import Product from 'sakurai-webapp/models/product';
import Section from 'sakurai-webapp/models/section';
import TermTaxonomy from 'sakurai-webapp/models/term-taxonomy';
import ChapterFilter from "sakurai-webapp/models/chapter-filter";
import FilterMap from "sakurai-webapp/objects/filter-map";

export default Ember.Controller.extend(
    Ember.Evented,
    ControllerMixin,
    FeatureMixin,{
    library: Ember.inject.controller(),
    headerClasses: Ember.inject.controller(),

    /**
     * @property {Class} selected class
     */
    class: Ember.computed.alias("library.class"),

    /**
     * @property {Section[]} list of sections
     */
    sections: Ember.computed.alias("library.sections"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    termTaxonomies: Ember.computed.alias("library.termTaxonomies"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies for filters
     */
    allTermTaxonomies: Ember.computed.alias("library.allTermTaxonomies"),

    /**
     * @property {termTaxonomy[]} list of term taxonomies concepts
     */
    termTaxonomiesConcepts: Ember.computed.alias("library.termTaxonomiesConcepts"),

    /**
     * @property {product} current product of this class
     */
    product: Ember.computed.alias("library.product"),

    /**
     * @property {string} default data type
     */
    defaultDataType: Ember.computed.alias("library.defaultDataType"),

    filterMap: FilterMap.create({}),

    /**
    * @property {Boolean} To know if Term Taxonomie is active
    **/
    termTaxonomyActive: false,

    /**
     * @property {string} selectedTermTaxonomy
     * Integer with the selected id from termTaxonomyTypeOptions
     * Used only if metadata is allowed
     */
    selectedTermTaxonomy: null,

    textTaxonomies: "clientNeeds ",

    /**
    Return question type, its depends of the user role
    **/
    typeFilter: Ember.computed(function(){
        return (this.get("isAuthoringEnabled"))? ChapterFilter.HIDDEN_FILTER: ChapterFilter.QUIZ_FILTER;
    }),

    /**
    * Return correct list of taxonomies or chapters
    **/
    itemsForFilterlist: Ember.computed('selectedTermTaxonomy', "termTaxonomyActive", "termTaxonomies", "sections", function(){
        return (this.get("termTaxonomyActive"))? this.get("termTaxonomies"): this.get("sections");
    }),

    /**
     * Return name of the object to use with the storage
     */
    filterVarName: Ember.computed('termTaxonomyActive', function(){
        return (this.get('termTaxonomyActive'))? 'termTaxonomyFilters': 'chapterFilters';
    }),

    /**
     * Updates metadata when the selection is changed
     */
    updateMetadata: Ember.observer('selectedTermTaxonomy', function(){
        var controller = this;
        var type = controller.get('selectedTermTaxonomy') || controller.get("defaultDataType");
        var product = controller.get("class").get("product");

        if (type && type !== Section.NURSING_TOPICS){
            var list = controller.get("allTermTaxonomies");
            //Check if taxonomy tag exist
            if (this.validateTaxonomyTagConcepts(type)) {
                list = controller.get("termTaxonomiesConcepts");
                var filterTag = TermTaxonomy.filterByType(list, type);
                controller.set("termTaxonomies", TermTaxonomy.convertTaxonomyTagToTree(filterTag, type));
            } else {
                var filter = TermTaxonomy.filterByType(list, type);
                controller.set("termTaxonomies", TermTaxonomy.convertToTree(filter, type));
            }
            controller.set("termTaxonomyActive", true);
            controller.set("textTaxonomies", Product.termTaxonomyAllowedByKey(product, type).label);
        }
        else{
            controller.set("textTaxonomies", this.get('terminologyTermPlural'));
            controller.set("termTaxonomyActive", false);
        }
    }).on("init"),

    /**
     * @property termTaxonomyTypeOptions
     * Object with the headers for drop down menu
     * Used only if metadata is allowed
     * Return Object
     */
    termTaxonomyTypeOptions: Ember.computed("class.product", function(){
        var product = this.get("class").get("product");
        this.set("selectedTermTaxonomy", product.get("defaultDataType"));
        return TermTaxonomy.findTermTaxonomyTypes(product);
    }),

    /**
     * @property {bool} indicates should show filter options
     */
    showFilterOptions: Ember.computed("isMetadataAllowed", "hasTaxonomiesForQuizzing", function(){
        return this.get("isMetadataAllowed") && this.get("hasTaxonomiesForQuizzing");
    }),

    removeRecords: function(recordArray) {
        var self = this,
            store = this.store;

        return new Ember.RSVP.Promise( function(resolve, reject) {
            var promises = [];

            recordArray.forEach( function(record) {
                Ember.Logger.debug(self.toString() + ': removing record with id: ', record.id);
                store.deleteRecord(record);
                promises.push(record.save());
            });

            Ember.RSVP.all(promises).then( function(promises_resolved) {
                Ember.Logger.debug(self.toString() + ': all records were successfully removed');
                // Make sure all async side-effects are run before resolving the promise

                //Clear delete filters into de store
                if (promises_resolved.get("length") > 0) {
                    promises_resolved.forEach( function(filter_deleted) {
                        var object = filter_deleted.get("chapter");
                        if (object && object.get("chapterFilters")) {
                            object.get("chapterFilters").clear();
                        } else {
                            object = filter_deleted.get("termTaxonomy");
                            if (object && object.get("termTaxonomyFilters")) {
                                object.get("termTaxonomyFilters").clear();
                            }
                        }
                    });
                }

                Ember.run(null, resolve);

            }, function() {
                var error = new Ember.Error('Unable to remove all records');
                // Make sure all async side-effects are run before rejecting the promise
                Ember.run(null, reject, error);
            });
        });
    },

    createRecords: function(recordArray) {
        var self = this;

        return new Ember.RSVP.Promise( function(resolve, reject) {
            var promises = [];

            recordArray.forEach( function(record) {
                Ember.Logger.debug(self.toString() + ': saving new record: ', record);
                promises.push(record.save());
            });

            Ember.RSVP.all(promises).then( function() {
                Ember.Logger.debug(self.toString() + ': all records were successfully saved');
                // Make sure all async side-effects are run before resolving the promise
                Ember.run(null, resolve);
            }, function() {
                var error = new Ember.Error('Unable to save all records');
                // Make sure all async side-effects are run before rejecting the promise
                Ember.run(null, reject, error);
            });
        });
    },

    resetValues: function(){
        this.get("filterMap").clear();
    },

    actions: {

        addFilter: function(data) {
            this.get('filterMap').addFilter(data);
        },

        removeFilter: function(data) {
            this.get('filterMap').removeFilter(data);
        },

        saveFilters: function(data) {
            var filters = this.get('filterMap'),
                self = this,
                store = this.store,
                removeQueue = [],
                createQueue = [];

            //Define which object from store need to use

            var currentProduct = (self.get("isAuthoringEnabled")) ? self.get("product"):null;

            filters.forEach( function(filterObject) {
                var record;
                var objectType = filterObject.get("dataType").get('constructor').toString();
                var itemNameStore = (objectType === "Chapter")? 'chapterFilter' : 'termTaxonomyFilter';

                if (filterObject.get('doesExist') && filterObject.get('willRemove')) {
                    record = store.getById(itemNameStore, filterObject.get('id'));
                    removeQueue.push(record);
                } else if (!filterObject.get('doesExist') && !filterObject.get('willRemove')) {
                    if (itemNameStore === 'termTaxonomyFilter') {
                        record = store.createRecord(itemNameStore, {type: filterObject.get("type"), instructor: filterObject.get("instructor"), termTaxonomy: filterObject.get("dataType"), product:currentProduct});
                    } else {
                        var filterData = {type: filterObject.get("type"), instructor: filterObject.get("instructor"), chapter: filterObject.get("dataType")};
                        if (self.get("isAuthoringEnabled")) {
                            filterData.product = currentProduct;
                        }
                        record = store.createRecord(itemNameStore, filterData);
                    }

                    createQueue.push(record);
                }
            });

            self.removeRecords(removeQueue).then( function() {
                self.createRecords(createQueue).then(function () {
                    self.trigger('asyncButton.restore', data.component);
                    self.transitionToRoute('library.home', self.get('class').get('id'));
                    //window.location = "#/library/home/"+ self.get("class").get("id");
                });
            });
        },

        exitWithoutSaving: function() {
            this.transitionToRoute('library.home', this.get('class').get('id'));
        }
    }

});
