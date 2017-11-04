/**
 * Component for showing a level in a scale
 *
 * @extends Ember.Component
 *
 */
SakuraiWebapp.LevelScaleComponent = Ember.Component.extend({

    tagName: 'div',

    classNames: ['level-scale'],

    classNameBindings: ['component-class', 'levelClass'],

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    /*
     * @property {string} i18n key to be used as the legend for the scale
     */
    'data-legend-text': '',

    /*
     * @property {number} The level value to use in the scale
     */
    'data-level-value': 0,

    /*
     * @property {bool} Is the level value in a calibrating state?
     */
    'data-is-calibrating': false,

    // Class that determines how the scale is supposed to look
    levelClass: Ember.computed('data-level-value', 'data-is-calibrating', function(){
        var level = this.get('data-level-value') || 0,
            isCalibrating = this.get('data-is-calibrating');

        if (isCalibrating) {
            return 'calibrating';
        } else {
            if (level <= 30) {
                return 'low';
            } else if (level > 30 && level <= 60) {
                return 'medium';
            } else if (level > 60 && level <= 100) {
                return 'high';
            }
        }
    }),

    levelValue: Ember.computed('data-level-value', function(){
        return this.get("data-level-value") || 0;
    }),

    levelPercentage: Ember.computed('levelValue', 'data-is-calibrating', function(){
        var value = this.get("levelValue"),
            isCalibrating = this.get('data-is-calibrating');
        var height = (isCalibrating) ? '0%' : value + '%';
        return Ember.String.htmlSafe("height: " + height);
    }),

    legendText: Ember.computed('data-is-calibrating', function(){
        var text;

        if (this.get('data-is-calibrating')) {
            return I18n.t('common.calibrating');
        } else {
            text = this.get('data-legend-text');
            return I18n.t(text);
        }
    })

});
