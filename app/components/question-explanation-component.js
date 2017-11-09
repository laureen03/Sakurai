/**
 *
 * Component to display the explanation section of a question
 *
 * @extends Ember.Component
 *
 */
import Ember from "ember"; 

export default Ember.Component.extend({

    classNames: ['question-explanation'],
    classNameBindings: ['component-class'],

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    /**
     * @property {array} [ { id: number, text: string } ... ]
     */
    'data-feedback': [],

    /**
     * @property {string} i18n key for the title
     */
    'data-title': null,

    hasFeedback: Ember.computed('data-feedback', function(){
        var feedbackItems = this.get('data-feedback');

        if (feedbackItems === undefined || !feedbackItems.length) {
            return false;
        }

        return feedbackItems.some( function(item) {
            if (!!item.text) {
                return true;
            }
        });

    }),

    didInsertElement: function() {

        this.$('.panel-heading a').on('click', this, function(e) {
            e.preventDefault();

            var $component = e.data.$();
            if ($component.hasClass('expanded')) {
                $component.removeClass('expanded');
                $component.addClass('collapsed');
            } else {
                $component.removeClass('collapsed');
                $component.addClass('expanded');
            }
        });
    },

    willDestroyElement: function() {
        this.$('.panel-heading a').off('click');
    }

});
