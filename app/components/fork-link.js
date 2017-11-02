/**
 * Component for adding a link that will redirect to a specific route
 * based on a condition
 *
 * @extends Ember.Component
 *
 * @param data-component-class {string} special class to add to the component's tag (optional)
 * @param condition {boolean} value that determines what redirect route to use
 * @param if-true {string} route to redirect to if 'condition' is true
 * @param if-false {string} route to redirect to if 'condition' is false
 * @param label {string} link text (for i18n helper)
 * @param param1 {string} first param to supply to the redirect route (optional)
 * @param param2 {string} second param to supply to the redirect route (optional)
 */

SakuraiWebapp.ForkLinkComponent = Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'li',

    classNames: ['fork-link'],
    classNameBindings: ['data-component-class'],

    route: null,

    /*
     * @property {string} Special component class
     */
    'data-component-class': '',

    setupRoute: function() {
        var trueRoute = this.get('if-true'),
            falseRoute = this.get('if-false');

        if (!trueRoute) {
            throw new Ember.Error('if-true parameter is required');
        }
        if (!falseRoute) {
            throw new Ember.Error('if-false parameter is required');
        }

        if (this.get('condition')) {
            this.set('route', trueRoute);
        } else {
            this.set('route', falseRoute);
        }
    }.on('init')

});
