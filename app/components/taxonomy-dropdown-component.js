/**
 *
 * Drop down component
 * @type {SakuraiWebapp.TaxonomyDropdownComponent }
 */
SakuraiWebapp.TaxonomyDropdownComponent = Ember.Component.extend({

    /**
     * @property {{id: "", name: "", type: "", group: ""}}
     */
    'data-items':null,

    /**
     * @property {string} type
     */
    'data-type': null,

    /**
     * @property {bool} indicates if the data should be filter by type
     */
    'data-filter-type': true,

    /**
     * @property {string} title label
     */
    'data-title': null,

    /**
     * @property {string} i18n key for title label
     */
    'data-title-i18n': null,

    /**
     * @property {string} prompt label
     */
    'data-prompt': null,

    /**
     * @property {string} i18n key for prompt label
     */
    'data-prompt-i18n': null,

    /**
     * @property {string} remove action
     */
    'data-remove-action': null,

    /**
     * @property selected items
     */
    'data-selected-items': null,

    /**
     * @property {number} selected item id
     */
    'data-selected-item': null,

    entriesToSorting: ['order', 'childOrder'],
    sortedItems: Ember.computed.sort('items', 'entriesToSorting'),

    didInsertElement: function(){
        var component = this;
        var $select = component.$("select");
        $select.select2({minimumResultsForSearch: 10});
        $select.on("change", function (e) { 
            var value = e.target.value
            if (value!= undefined && value != ""){
                component.selectItem(e.target.value);
                component.$("select").val("").trigger("change");
            }
        });

        if (SakuraiWebapp.TermTaxonomy.NURSING_CONCEPTS == component.get("data-type")) {
            $select.on("select2:open", function (e) { 
                $(".select2-results__options").css('max-height', '400px');
            });
        }
    },

    /**
     * Select a term taxonomy
     * @param {number} id
     */
    selectItem: function(id){
        var taxonomies = this.get("data-items");
        var taxonomy = taxonomies.filterBy("id", id).get("firstObject");

        if (taxonomy){
            var selectedTaxonomies = this.get("data-selected-items");
            if(selectedTaxonomies.findBy('id', taxonomy.id) === undefined)
                selectedTaxonomies.pushObject(taxonomy);
        }
    },

    /**
     * Removes a selected term taxonomy
     * @param {SakuraiWebapp.TermTaxonomy} taxonomy
     */
    removeItem: function(taxonomy){
        if (taxonomy){
            var selectedTaxonomies = this.get("data-selected-items");
            selectedTaxonomies.removeObject(taxonomy);
        }
    },

    /**
     * Return strengths per type
     * @property {{}}
     */
    items: Ember.computed("data-items.[]", "data-type", function(){ 
        var options = Ember.A();

        var type = this.get("data-type");
        var filteredItems = (this.get("data-filter-type")) ? //filtering items by type
            SakuraiWebapp.TermTaxonomy.filterByType(this.get("data-items"), type) :
            this.get("data-items");

        filteredItems.forEach(function(item){
            var children = filteredItems.filterBy("parent", parseInt(item.get("id")));
            var hasChildren = children.get("length") > 0;
            if (hasChildren){
                children.forEach(function(child){
                    options.pushObject({
                        id: child.get("id"),
                        name: child.get("name"),
                        group: item.get("name"),
                        order: item.get("termOrder"),
                        childOrder: child.get("termOrder")
                    });
                });
            }
            else{
                if (type == SakuraiWebapp.TermTaxonomy.BLOOM_TAXONOMY){//blooms has no parent
                    options.pushObject({
                        id: item.get("id"),
                        name: item.get("name"),
                        group: "",
                        order: item.get("termOrder")
                    });
                }
            }
        });

        return options
    }),

    /**
     * Indicates if there are filters to apply
     * @property {bool}
     */
    hasItems: Ember.computed("items.[]", function(){ 
        return this.get("items").get("length") > 0;
    }),

    selectedItems: Ember.computed("data-selected-items.[]", "data-type", function(){ 
        var type = this.get("data-type");
        return (this.get("data-filter-type")) ? //filtering items by type
            SakuraiWebapp.TermTaxonomy.filterByType(this.get("data-selected-items"), type) :
            this.get("data-selected-items");
    }),

    /**
     * @property {string} title label
     */
    title: Ember.computed("data-title", "data-title-i18n", function(){ 
        var i18n = this.get("data-title-i18n");
        var label = this.get("data-title");
        if (i18n){
            label = I18n.t(i18n);
        }

        return label;
    }),

    /**
     * @property {string} prompt label
     */
    prompt: Ember.computed("data-prompt", "data-prompt-i18n", function(){ 
        var i18n = this.get("data-prompt-i18n");
        var label = this.get("data-prompt");
        if (i18n){
            label = I18n.t(i18n);
        }

        return I18n.t("add") + " " + label;
    }),

    actions:{
        onRemoveItem: function(item){
            var component = this;
            component.removeItem(item);
            if (this.get('data-remove-action')){
                this.sendAction('data-remove-action', item);
            }

        }
    }

});
