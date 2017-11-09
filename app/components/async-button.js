/**
 * Component for displaying a button that fires off an async operation in the targetObject.
 *
 * While the operation is carried out in the targetObject (i.e. controller or router),
 * the button becomes a loading spinner. When the operation is done, the targetObject is
 * expected to fire off an event ('asyncButton.restore') so the button restores to its normal state.
 *
 * @extends Ember.Component
 */

import Ember from "ember"; 

export default Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'span',

    attributeBindings: ['data-button-class', 'data-text', 'data-param'],
    classNameBindings: ['asyncButtonClass'],

    asyncButtonClass: 'async-button',

    /*
     * @property {string} Special component class
     */
    'data-button-class': '',

    /*
     * @property {string} Button text
     */
    'data-text': '',

    /*
     * @property Parameter sent to the controller action
     */
    'data-param': null,

    /*
     * === METHODS
     */
    /*
     * Register the component as a property of a parent component using the property register-as
     */
    _register: function() {
        if (this.get('parent')){
            this.get('parent').registerButton(this);
        }
        this.set('register-as', this);
    }.on('init'),

    restoreButton: function (componentId) {

        var id = this.get('elementId');

        if (id === componentId) {
            // Make sure we are restoring the right button
            Ember.Logger.debug(this.toString() + ': restore button in component #' + componentId);
            this.$('.glyphicon').addClass('invisible')
                                .removeClass('animate-spin');
            this.$('.text').removeClass('invisible');
            this.$('button').removeAttr('disabled');
        }
    },

    /*
     * === EVENTS
     */
    didInsertElement: function() {
        // Subscribe to events
        this.get('targetObject').on('asyncButton.restore', this, this.restoreButton);
    },

    willDestroyElement: function() {
        // Unsubscribe from events
        this.get('targetObject').off('asyncButton.restore', this, this.restoreButton);
    },

    actions: {

        showSpinner: function() {
            var componentId = this.get('elementId'),
                data = {
                    component: componentId,
                    param: this.get('data-param')
                };

            Ember.Logger.debug(this.toString() + ': show spinner');
            this.$('button').attr('disabled', true);
            this.$('.text').addClass('invisible');
            this.$('.glyphicon').removeClass('invisible')
                                .addClass('animate-spin');

            this.sendAction('action', data);
        }
    }

});
