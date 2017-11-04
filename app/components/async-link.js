/**
 * Component for displaying a link that fires off an async operation in the targetObject.
 *
 * While the operation is carried out in the targetObject (i.e. controller or router),
 * the component link becomes a loading spinner. When the operation is done, the targetObject is
 * expected to fire off an event ('asyncLink.restore') so the link restores to its normal state.
 *
 * @extends Ember.Component
 */

SakuraiWebapp.AsyncLinkComponent = Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    attributeBindings: ['data-component-class', 'data-text', 'data-param'],
    classNameBindings: ['asyncLinkClass', 'data-component-class'],

    asyncLinkClass: 'async-link',

    /*
     * @property {string} Special component class
     */
    'data-component-class': '',

    /*
     * @property {string} Component link text
     */
    'data-text': '',

    /*
     * @property Parameter sent to the controller action
     */
    'data-param': null,

    /*
     * === METHODS
     */
    restoreLink: function (componentId) {

        var id = this.get('elementId');

        if (id == componentId) {
            // Make sure we are restoring the right link
            Ember.Logger.debug(this.toString() + ': restore link in component #' + componentId);
            this.$('.glyphicon').addClass('invisible')
                                .removeClass('animate-spin');
            this.$('a').removeClass('invisible');
        }
    },

    /*
     * === EVENTS
     */
    didInsertElement: function() {
        // Subscribe to events
        this.get('targetObject').on('asyncLink.restore', this, this.restoreLink);
    },

    willDestroyElement: function() {
        // Unsubscribe from events
        this.get('targetObject').off('asyncLink.restore', this, this.restoreLink);
    },

    actions: {

        showSpinner: function() {
            var componentId = this.get('elementId'),
                data = {
                    component: componentId,
                    param: this.get('data-param')
                };

            Ember.Logger.debug(this.toString() + ': show spinner');
            this.$('a').addClass('invisible');
            this.$('.glyphicon').addClass('animate-spin')
                                .removeClass('invisible');

            this.sendAction('action', data);
        }
    }

});
