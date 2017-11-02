/**
 * Component for displaying the correct data type name based on the product settings object
 *
 * Based on the product settings, one of the following data type strings will be output:
 * - "nursing topic"
 * - "client need"
 * - "nursing concept"
 * - "chapter"
 *
 * @extends Ember.Component
 *
 * @param component-class {string} special class to add to the component's tag (optional)
 * @param data-product {Object} product instance from where the settings will be read
 * @param is-plural {boolean} will the data type name be plural? (nursing topic vs. nursing topics)
 *
 */

SakuraiWebapp.SakuraiDataTypeComponent = Ember.Component.extend({

    tagName: 'span',

    classNames: ['sakurai-data-type'],
    classNameBindings: ['component-class'],

    dataTypeName: '',

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    calculateDataTypeName: function() {
        var product = this.get('data-product'),
            count = this.get('is-plural') ? 2 : 1,
            dataType = product.get('defaultDataType'),
            settings = product.get('settings'),
            dataTypeName, chapterTerminology, defaultTerminology;
        // TODO: This would ideally be:
        // if (product.get('isDataTypeSections')) however, if product.settings.defaultDataType
        // is not defined then it's default value becomes 'nursing_topics' so checking for that as well
        if (dataType == 'sections' || dataType == 'nursing_topics') {
            chapterTerminology = settings && settings.terminology && settings.terminology.chapter || null;
            defaultTerminology = I18n.t('chapters', { count: count });
            
            if (chapterTerminology)
                dataTypeName = count > 1 ? Ember.String.pluralize(chapterTerminology) : Ember.String.singularize(chapterTerminology);
            else
                dataTypeName = defaultTerminology;

        } else {
            dataTypeName = I18n.t(dataType, { count: count });
        }

        this.set('dataTypeName', dataTypeName);

    }.on('init')

});
