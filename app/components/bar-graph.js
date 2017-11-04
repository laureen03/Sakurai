/**
 * Component for showing a bar graph of a value relative to a whole.
 * The value can also be compared to another baseline value.
 *
 * @extends Ember.Component
 *
 * @param data-component-class {string} special class to add to the component's tag (optional)
 * @param currentValue {number} value to highlight in graph
 * @param baselineValue {number} baseline value to use against 'currentValue' (optional)
 * @param caption {string} graph caption (property to use with i18n helper)
 */

SakuraiWebapp.BarGraphComponent = Ember.Component.extend({
    tagName: 'figure',

    classNames: ['bar-graph'],
    classNameBindings: ['data-component-class'],

    /*
     * @property {string} Special component class
     */
    'data-component-class': '',

    min_value: 1,

    init: function() {
        var value = this.get('currentValue') || 0,
            baseline = this.get('baselineValue');

        // Call Ember.Component init method
        this._super();

        this.validateRange(value);
        this.set('currentValue', this.fixDecimals(value));

        if (baseline) {
            this.validateRange(baseline);
        }
    },

    currentDisplayValue: Ember.computed('currentValue', function(){
        return (this.get('currentValue') > 0)? this.get('currentValue') : this.get('min_value');
    }),

    isUnderBaseline: Ember.computed('baselineValue', 'currentDisplayValue', function(){
        return (this.get('baselineValue') > this.get('currentDisplayValue'));
    }),

    isOverBaseline: Ember.computed('baselineValue', 'currentDisplayValue', function(){
        return (this.get('currentDisplayValue') >= this.get('baselineValue'));
    }),

    valueClass: Ember.computed('baselineValue', 'currentDisplayValue', function(){
        var baselineValue = this.get('baselineValue');
        var currentValue = this.get('currentDisplayValue');

        if (baselineValue > currentValue) {
            return 'fail';
        } else if (currentValue > baselineValue) {
            return 'success';
        } else {
            return 'default';
        }
    }),

    baselineWidth: Ember.computed('baselineValue', function(){
        var baselineValue = this.get('baselineValue');
        return Ember.String.htmlSafe("width: " + this.getWidth(baselineValue, 0));
    }),

    lineWidth: Ember.computed('currentDisplayValue', function(){
        var currentValue = this.get('currentDisplayValue');
        return Ember.String.htmlSafe("width: " + this.getWidth(currentValue, 0));
    }),

    valueOffset: Ember.computed('currentDisplayValue', function(){
        var currentValue = this.get('currentDisplayValue');
        return Ember.String.htmlSafe("left: " + this.getWidth(currentValue, -1));
    }),

    getWidth: function(value, offset) {
        return ((value * 100 / 8) + offset) + '%';
    },

    validateRange: function(value) {
        if (typeof value == 'number') {

            if (value >= 0 && value <= 8) {
                return value;
            } else {
                throw new Ember.Error('BarGraphComponent: value is out of range. Expecting 0 <= value <= 8');
            }
        } else {
            throw new Ember.Error('BarGraphComponent: value is not a number. Expecting a number.');
        }
    },

    fixDecimals: function (value) {
        var intVal = Math.floor(value),
            decimalVal = value % 1,
            decimalStr = decimalVal.toFixed(2),
            numFixed;

        if (decimalVal > 0 || +decimalStr > 0) {
            // If there are decimal numbers, we want to narrow it down to 2.
            // If out of the two, the right-most number is a zero then only show one decimal number.
            if (decimalStr.charAt(3) == '0') {
                decimalVal = +(decimalStr.substring(0, 3));
                numFixed = 1;
            } else {
                decimalVal = +decimalStr;
                numFixed = 2;
            }
            return +(intVal + decimalVal).toFixed(numFixed);
        } else {
            return intVal;
        }
    }

});
