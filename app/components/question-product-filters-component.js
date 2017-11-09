/**
 * Component for displaying/updating question product filters
 * @see question-partial.hbs
 *
 * @extends Ember.Component
 *
 * @param data-store {store} ember store
 * @param data-question {Question} question to apply the filter to
 * @param data-products {Product[]} products
 */
import Ember from "ember"; 
import QuestionFilter from "models/question-filter";

export default Ember.Component.extend(
    Ember.Evented,
    {

    /**
     * @property {Ember.DS.Store}
     */
    'data-store': null,

    /**
     * @property {Question}
     */
    'data-question': null,

    /**
     * @property {Product[]}
     */
    'data-products': null,

    /**
     * Question product filters
     * @property {Ember.A}
     */
    'data-product-filters': Ember.A(),

    /**
     * Contains the information for all provided products, it could be not all products have
     * a filter for this question
     * @property {Ember.A}
     */
    'productFilterItems' : Ember.A(),

    /**
     * @product {bool}
     */
    hasProductFilters: Ember.computed.notEmpty("data-product-filters"),

    /**
     * @product {bool}
     */
    hasProductFilterItems: Ember.computed.notEmpty("productFilterItems"),

    /**
     * On init event listener
     */
    onInitialize: function(){
        var component = this;

        if (!component.get('hasProductFilters')){ //when empty, load filters from question
            var question = component.get("data-question"),
                questionFilters = question.get('questionFilters');

            questionFilters.then( function( questionFilters ) {
                var promises = questionFilters.map(function(filter){
                    return filter.get("resolve");
                });

                Ember.RSVP.all(promises).then(function(){
                    var filters = questionFilters.filter(function(filter){
                        return !filter.get("isInstructor");
                    });
                    component.set("data-product-filters", filters);
                    component.loadProductFiltersFromData();
                });
            });
        }
    }.on("init"),

    /**
     * Loads the product filter items
     */
    loadProductFiltersFromData: function(){
        this.set("productFilterItems", this.getProductFilterItems());
    },

    /**
     * Returns information for all provided products, it could be not all products have
     * a filter for this question
     * @property {Ember.A}
     */
    getProductFilterItems: function(){
        var products = this.get("data-products"),
            filters = this.get('data-product-filters');
        var items = Ember.A();
        products.forEach(function(product){
            var found = filters.filterBy("product.id", product.get("id")),
                hasFilter = found.get("length") > 0,
                filter = (hasFilter) ? found.get("firstObject") : null;
            items.push(Ember.Object.create({
                id: "filter-" + product.get("id"),
                product: product,
                filter: filter,
                type: hasFilter ? filter.get("type") : "everyone"
            }));
        });
        return items;
    },

    /**
     * Removes a filter
     * @param filterItem
     */
    removeFilter: function(filterItem){
        var store = this.get("data-store"),
            filter = filterItem.get("filter"),
            productFilters = this.get("data-product-filters");
        store.deleteRecord(filter);
        return filter.save().then(function(){
            productFilters.removeObject(filter);
        });
    },

    /**
     * Updates a filter
     * @param filterItem
     */
    updateFilter: function(filterItem){
        var filter = filterItem.get("filter");
        if (filter.get("type") !== filterItem.get("type")){
            filter.set("type", filterItem.get("type"));
            filter.set("question", this.get("data-question"));
            var promises = [filter.get("question"), filter.get("product")];
            return Ember.RSVP.all(promises).then(function(){ //resolve lazy relations before saving
                return filter.save();
            });
        }
        return false;
    },

    /**
     * Creates a filter
     * @param filterItem
     */
    createFilter: function(filterItem){
        var store = this.get("data-store"),
            component = this,
            productFilters = component.get("data-product-filters");
        var record = QuestionFilter.createQuestionFilterRecord(store, {
            type: filterItem.get("type"),
            questionId: component.get("data-question.id"),
            productId: filterItem.get("product.id")
        });
        return record.then(function(filter){
            return filter.save().then(function(){
                productFilters.pushObject(filter);
            });
        });
    },

    /**
     * Save filters information
     */
    saveFilters: function(data){
        var component = this,
            productFilterItems = this.get("productFilterItems");
        var promises = [];
        productFilterItems.forEach(function(item){
            var everyone = item.get("type") === "everyone",
                hasFilter = item.get("filter");
            if (everyone && hasFilter){ //when filter was removed
                promises.push(component.removeFilter(item));
            }
            else if (!everyone && !hasFilter){//when creating new filter
                promises.push(component.createFilter(item));
            }
            else if (!everyone && hasFilter){//when updating the filter
                promises.push(component.updateFilter(item));
            }
        });

        Ember.RSVP.all(promises).then(function(){
            component.trigger('asyncButton.restore', data.component);
            component.closeModal();
        });
    },

    /**
     * Closes the modal
     */
    closeModal: function(){
        this.$(".question-product-filters-modal").modal("hide");
    },

    /**
     * Open the modal
     */
    openModal: function(){
        this.loadProductFiltersFromData();
        this.$(".question-product-filters-modal").modal("show");
    },

    actions: {
        onSaveFilters: function(data){
            this.saveFilters(data);
        },

        onCancelFilters: function(){
            this.closeModal();
        },

        openFilterModal: function(){
            this.openModal();
        }
    }


});