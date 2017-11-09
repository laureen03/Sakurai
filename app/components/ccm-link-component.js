/**
 * Component for displaying a ccm link
 *
 * @extends Ember.Component
 *
 * @param data-ccm-key {string} ccm key to create the link
 * @param data-i18n-label {string} i18n for link label
 * @param data-product-isbn {string} isbn
 * @param data-class {Class} the class (optional)
 * @param data-class-names {string} the class names for the inner element (optional)
 */

import Ember from "ember"; 
import CCMHelper from "utils/ccm-helper";

export default Ember.Component.extend({

    tagName: 'span',

    /**
     * @property classes for the inner element
     */
    'data-class-names': null,

    /**
     * @property {string} ccm key
     */
    'data-ccm-key': null,

    /**
     * @property {string} i18n key for link label
     */
    'data-i18n-label': null,

    /**
     * @property {string} product isbn
     */
    'data-product-isbn': null,

    /**
     * @property {Class} the class
     */
    'data-class': null,

    /**
     * @property {CCMHelper}
     */
    ccmHelper: null,

    setupCCM: function(){
        if (!this.get("data-ccm-key")){
            throw new Ember.Error('data-ccm-key parameter is required');
        }

        if (!this.get("data-i18n-label")){
            throw new Ember.Error('data-i18n-label parameter is required');
        }

//        if (!this.get("data-product-isbn")){
//            throw new Ember.Error('data-product-isbn parameter is required');
//        }

        this.set("ccmHelper", CCMHelper.create({}));

    }.on("init"),

    actions:{

        goToCCM: function(){
            var helper = this.get("ccmHelper");
            var route = helper.getRoute(this.get("data-ccm-key"),
                {
                    class: this.get("data-class"),
                    isbn: this.get("data-product-isbn")
                }
            );
            Ember.Logger.debug("CCM: " + route);
            top.location = route;
        }
    }
});
