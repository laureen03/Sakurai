/**
 * Component for displaying a list of filtered items, optionally introduced by a header
 *
 * @extends Ember.Component
 *
 * @param data-component-class {string} special class to add to the component's tag (optional)
 * @param data-item-list {Ember.A} list of items to go through
 * @param data-filter-property {string} item property to filter by
 * @param data-filter-value {string} value to use for filtering (only items where data-filter-property
 *                                   is equal to data-filter-value will be added to the final list)
 * @param data-output-property {string} item property to output from all items in the final list
 * @param data-header {string} header used to introduce the final list (optional)
 * @param data-item-action {function} action to call on click (optional)
 * @param data-icon {bool} render icon (optional)
 * @param data-icon-class {bool} add icon class (optional)
 *
 */

import Ember from "ember"; 

export default Ember.Component.extend({ 

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['word-list'],
    classNameBindings: ['data-component-class'],

    outputList: null,

    /*
     * @property {string} Special component class
     */
    'data-component-class': '',

    setupOutputList: function() {
        var filterProperty = this.get('data-filter-property'),
            filterValue = this.get('data-filter-value'),
            outputProperty = this.get('data-output-property'),
            self = this;
        if (this.get('data-item-list')){
            this.get('data-item-list').then( function(allItems) {
                var outputList;

                outputList = allItems.filter( function(item) {
                    return item.get(filterProperty) === filterValue;
                }).map( function(item) {
                    return {
                        label: item.get(outputProperty),
                        item: item
                    };
                });

                self.set('outputList', outputList);
            });
        }

    }.on('init'),

    actions:{
        /**
         * On item click
         * @param item
         */
        onItemClick: function(item){
            var assignmentId = null;
            if(this.get('data-assignment')){
                assignmentId = this.get('data-assignment');
            }
            this.sendAction('data-item-action', item, assignmentId);
        }
    }

});
