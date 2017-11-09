/**
 * Component for displaying information about performance on a term taxonomy
 *
 * @extends BarGraphComponent
 *
 * @param data-component-class {string} special class to add to the component's tag (optional)
 * @param data-performance {TermTaxonomyPerformance | ChapterPerformance} performance instance
 * @param data-value-property {string} name of the property holding the value
 * @param data-performance-name {string} performance name. Since performance may be either a
 *        TermTaxonomyPerformance instance or a ChapterPerformance instance, the way to get the
 *        name is not the same for both so it's easier to ask for it as a parameter.
 * @param data-highlight-from {number} the bar graph may have a range in the graph highlighted.
 *        This value determines the start of the highlighted range. If this parameter is set but
 *        data-highlight-to isn't then the range will extend all the way to the end of the graph.
 * @param data-highlight-to {number} the bar graph may have a range in the graph highlighted.
 *        This value determines the end of the highlighted range. If this parameter is set but
 *        data-highlight-from isn't then the range will start from the beginning of the graph.
 * @param data-highlight-text text to display over the highlighted area (see @data-highlight-from
 *        or @data-highlight-to). (optional -property to use with the i18n helper)
 * @param caption {string} graph caption (optional -property to use with i18n helper)
 */

import Ember from "ember"; 

export default Ember.Component.extend({

    tagName: 'div',

    classNames: ['performance-graph'],
    classNameBindings: ['data-component-class'],

    /*
     * @property {string} Special component class
     */
    'data-component-class': '',
    'data-performance': null,
    'data-performance-name': '',
    'data-highlight-from': 0,
    'data-highlight-to': 8,
    'data-value-property': 'currentMasteryLevel',
    'rangeTextWidth': '50%',   // this must be a percentage value

    /**
     * @property {string} item click action name
     */
    'data-item-click': null,

    init: function() {
        var performance = this.get('data-performance'),
            property = this.get('data-value-property');

        this.set('currentValue', performance.get(property));

        // Call BarGraphComponent init method
        this._super();
    },

    rangeTextStyle: Ember.computed('rangeTextWidth', 'rangeTextOffset', function(){
        return Ember.String.htmlSafe("left: " + this.get("rangeTextOffset") + '; width:' + this.get("rangeTextWidth"));
    }),

    rangeStyle: Ember.computed('rangeOffset','rangeWidth', function(){
        return Ember.String.htmlSafe("left: " + this.get("rangeOffset") + "; width: " + this.get("rangeWidth"));
    }),

    lineStyle: function(){
        return Ember.String.htmlSafe("width: " + this.get("lineWidth"));
    },

    rangeOffset: Ember.computed('data-highlight-from', function(){
        var rangeStartValue = this.get('data-highlight-from');
        var width = +(this.getWidth(rangeStartValue, 0).split('%')[0]);
        return (width>95?(width-10): width)+'%';
    }),

    thresholdBasePosition: Ember.computed('rangeOffset', 'rangeWidth', 'rangeTextWidth', function(){
        var rangeOffset = this.get('rangeOffset'),
            rangeWidth = this.get('rangeWidth'),
            rangeTextWidth = this.get('rangeTextWidth');

        // Get number values from the percentage strings
        rangeOffset = +(rangeOffset.split('%')[0]);
        rangeWidth = +(rangeWidth.split('%')[0]);
        rangeTextWidth = +(rangeTextWidth.split('%')[0]);

        rangeWidth /= 2;
        rangeTextWidth /= 2;
        return rangeOffset + rangeWidth - rangeTextWidth;
    }),

    rangeWidth: Ember.computed('data-highlight-from', 'data-highlight-to', function(){
        var rangeStartValue = this.get('data-highlight-from'),
            rangeEndValue = this.get('data-highlight-to');

        return this.getWidth(rangeEndValue - rangeStartValue, 0);
    }),

    rangeTextOffset: Ember.computed('thresholdBasePosition', function(){
        var position = this.get("thresholdBasePosition");
        return (position>70 ? (position-5) : position)+'%';
    }),

    actions:{
        /**
         * Handle click on a performance item
         */
        onPerformanceClick: function(){
            this.sendAction('data-item-click', this.get("data-performance.termTaxonomy.id"));
        }
    }

});
