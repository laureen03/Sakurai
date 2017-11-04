/**
 * Component for adding a link that will redirect to one of two routes:
 * - if true, go to: student.metadata
 * - if false, go to: student.section
 * based on a default condition
 *
 * @extends SakuraiWebapp.ForkLinkComponent
 *
 * @param data-component-class {string} special class to add to the component's tag (optional)
 * @param data-class {Class} class in context
 * @param label {string} link text (for i18n helper)
 */

SakuraiWebapp.MetadataForkLinkComponent = SakuraiWebapp.ForkLinkComponent.extend({

    /*
     * === PROPERTIES
     */
    'if-true': 'student.metadata',
    'if-false': 'student.section',
    'data-style' : '',

    setupRoute: function() {
        var trueRoute = this.get('if-true'),
            falseRoute = this.get('if-false'),
            clazz = this.get('data-class');

        if (!clazz) {
            throw new Ember.Error('class parameter is required');
        }

        if (clazz.get('product')) {
            if (clazz.get('product').get('isMetadataAllowed')) {
                this.set('route', trueRoute);
            } else {
                this.set('route', falseRoute);
            }
        } else {
            Ember.Logger.warn(this.toString() + ': class does not have a product property');
        }
    }.on('init')

});
