import Ember from "ember"; 
import RemediationLink from "models/remediation-link";

export default Ember.Component.extend({

    /**
     * @property {Bool} Remediation Link Active or Not
     */
    activeRemediationLinks: false,

    /**
     * @property {String} Radio Remediation Value
     */
    remediationRadioVal: "search",

    /**
     * @property {Array} Book List
     */
    books: Ember.A(),

    /**
     * @property {Array} Category List
     */
    categories: Ember.A(),

    /**
     * @property {Array} Sub Category List
     */
    subCategories: Ember.A(),

    /**
     * @property {DataStore} Store of the app
     */
    store: null,

    /**
     * @property {Array} Id of selected book
     */
    typeRemediationLinks: "LA",

    /**
     * @property {Array} Id of selected book
     */
    bookIds: [],

    /**
     * @property {Array} Id of selected category
     */
    categoryId: [],

    /**
     * @property {Array} Id of selected sub-category
     */
    subCategoryId: [],

    /**
     * @property {RemediationLinkCategory} selected category
     */
    remediationLinks: null,

    /**
     * @property {String} search term information
     */
    searchTerm: "",

    /**
     * @property {Boolean} web flag
     */
    isWeb: false,

    /**
     * @property {string} save question action
     */
    'data-save-action': "saveRemediation",

    /* Manage Errors */
    bookError: false,
    categoryError: false,
    subCategoryError: false,
    hasSubCategory: false,

    /**
     * Remediation links Type
     */
    typesRemediationLinks: Ember.computed(function(){
        return RemediationLink.getRemediationLinksTypes();
    }),

    /**
     * Observe for radio value
     **/
    isSearch: Ember.computed("remediationRadioVal", function(){
        var isSearch = (this.get("remediationRadioVal") === "search") ? true : false;
        this.set("remediationLinks", null);
        if (isSearch) {
            this.set("books", Ember.A());
            this.set("categories", Ember.A());
            this.set("subCategories", Ember.A());
        } else {
            if (this.get("typeRemediationLinks") === RemediationLink.LA){
                this.loadBooks();
            }
            else{
                this.loadBrowseLP();
            }
        }
        return isSearch;
    }), 

    /**
     * Observe for radio value
     **/
    isLA: Ember.computed("typeRemediationLinks", function(){
        var component = this;
        component.resetValues();
        if (component.get("typeRemediationLinks") === RemediationLink.WEB) {
            component.set("isWeb", true);
            return false;
        } else {
            component.set("isWeb", false);
            return (component.get("typeRemediationLinks") === RemediationLink.LA) ? true : false;
        }

    }),

    /**
     * Observe for Book Selected
     **/
    bookIdObserve: Ember.observer('bookIds.[]', function () {
        if (this.isDestroyed || this.isDestroying) {
            return;
        }
        var result = this.get('bookIds').mapBy('id');
        if (result.length > 1)
        {
            this.set("bookError", true); //show error
            this.set("categories", Ember.A());
            this.set("subCategories", Ember.A());
            this.set("remediationLinks", null);
        } else {
            this.set("bookError", false);
            if (result.length !== 0) {
                this.loadCategory(result[0]);
            }
        }
    }),

    /**
     * Observe for Category Selected
     **/
    categoryIdObserve: Ember.observer('categoryId.[]', function () {
        if (this.isDestroyed || this.isDestroying) {
            return;
        }
        var component = this,
                result = component.get('categoryId').mapBy('id');
        if (result.length > 1)
        {
            this.set("categoryError", true); //show error
            this.set("remediationLinks", null);
            this.set("subCategories", Ember.A());
        } else {
            this.set("categoryError", false);
            if (result.length !== 0) {
                component.set("subCategoryId", []);
                component.set("remediationLinks", component.get("categories").findBy("id", result[0]).get("remediationLinks"));
                var subCategories = component.get("categories").findBy("id", result[0]).get("subCategories");
                if (subCategories.get('length')) {
                    component.set("subCategories", subCategories);
                    component.set("hasSubCategory", true);
                } else {
                    component.set("hasSubCategory", false);
                }
            }
        }
    }),
    
    /**
     * Observe for Sub-Category Selected
     **/
    subCategoryIdObserve: Ember.observer('subCategoryId.[]', function () {
        if (this.isDestroyed || this.isDestroying) {
            return;
        }
        var component = this,
                result = component.get('subCategoryId').mapBy('id');
        if (result.length > 1)
        {
            this.set("subCategoryError", true); //show error
            this.set("remediationLinks", null);
        } else {
            this.set("subCategoryError", false);
            if (result.length !== 0) {
                component.set("remediationLinks", component.get("subCategories").findBy("id", result[0]).get("remediationLinks"));
            }
        }
    }),

    didInsertElement: function () {
        $(".add-remediation-link-section .remediation-select").select2();
    },

    /**
     * Books can be selected
     */
    loadBooks: function () {
        var component = this,
                store = component.get("store");
        component.$('.book-spinner').removeClass("hide");
        store.find("remediationLinkBook").then(function (books) {
            component.set("books", books);
            component.$('.book-spinner').addClass("hide");
        });
    },

    /**
     * Categories can be selected
     */
    loadCategory: function (id) {
        var component = this,
                store = component.get("store");
        component.$('.category-spinner').removeClass("hide");
        component.set("categories", Ember.A());
        component.set("subCategories", Ember.A());
        component.set("remediationLinks", null);
        component.set("categoryId", []);
        component.set("subCategoryId", []);
        component.set("hasSubCategory", false);
        store.query("remediationLinkCategory", {bookId: id}).then(function (categories) {
            var firstLevelCategories = Ember.A();
            categories.forEach(function(category) {
                if (category.get('level') === 1){
                    firstLevelCategories.push(category);
                }
            });
            component.set("categories", firstLevelCategories);
            component.$('.category-spinner').addClass("hide");
        });
    },

    loadBrowseLP: function () {
        var component = this,
                store = component.get("store");
        component.$('.list-spinner').removeClass("hide");
        store.find("remediationLink", {type: component.get("typeRemediationLinks")}).then(function (remediationLinks) {
            component.set("remediationLinks", remediationLinks);
            component.$('.list-spinner').addClass("hide");
        });
    },

    resetValues: function () {
        this.set("remediationRadioVal", "search");
        $(".add-remediation-link-section input[type=radio]:eq(0)").prop("checked", true);
        this.set("books", Ember.A());
        this.set("categories", Ember.A());
        this.set("bookIds", []);
        this.set("categoryId", []);
        this.set("subCategories", Ember.A());
        this.set("subCategoryId", []);
        this.set("remediationLinks", null);
        this.set("searchTerm", "");
        this.set("isWeb", false);
    },

    /**
     *
     */
    willDestroyElement: function () {
        this.resetValues();
    },

    saveRemediation: function (remediationLinkRecord) {
        var component = this;
        remediationLinkRecord.save().then(function (remediationLinkSaved) {
            //send to add this 
            component.set("activeRemediationLinks", false);
            component.set("typeRemediationLinks", RemediationLink.LA);
            $(".add-remediation-link-section .remediation-select").val(RemediationLink.LA).trigger("change");
            component.sendAction(
                    "data-save-action",
                    remediationLinkSaved
                    );
        });
    },

    actions: {
        activeRemediation: function () {
            this.set("activeRemediationLinks", true);
        },

        addRemediation: function (remediationLink) {
            var component = this;
            var remediationLinkRecord = this.get("store").createRecord("remediationLink", {
                name: remediationLink.get("name"),
                type: remediationLink.get("type"),
                url: remediationLink.get("url"),
                parameters: remediationLink.get("parameters")
            });
            component.saveRemediation(remediationLinkRecord);
        },

        addWebType: function (remediationName, remediationUrl) {
            var component = this;

            var remediationLinkRecord = this.get("store").createRecord("remediationLink", {
                name: remediationName,
                type: RemediationLink.WEB,
                url: remediationUrl
            });
            component.saveRemediation(remediationLinkRecord);
        },

        onRemediationLinkClick: function (remediationLink) {
            window.open(remediationLink.get("fullUrl"));
        },

        onSearch: function () {
            var component = this,
                    store = component.get("store"),
                    searchTerm = component.get("searchTerm");
            component.$('.search-spinner').removeClass("hide");
            if (searchTerm.trim() !== "") {
                store.query("remediationLink", {term: searchTerm, type: component.get("typeRemediationLinks")}).then(function (remediationLinks) {
                    component.set("remediationLinks", remediationLinks);
                    component.$('.search-spinner').addClass("hide");
                });
            }
        }
    }
});