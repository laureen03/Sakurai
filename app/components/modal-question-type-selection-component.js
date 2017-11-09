/**
 * Component for displaying a modal with question types that can be selected
 *
 * @extends Ember.Component
 *
 * @param component-class {string} special class to add to the component's tag (optional)
 * @param is-visible {bool} should the modal be visible or hidden?
 * @param selected-question-types {array} array of question type codes that have been selected
 * @param on-apply {string} name of action to send to the target when clicking on the apply button.
 *                          An array with all the question type codes selected is sent.
 */
import Ember from "ember"; 

export default Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['modal-question-type-selection', 'modal', 'fade'],
    classNameBindings: ['component-class'],

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    questionTypes: Ember.computed.alias('sakuraiConfig.questionTypes'),

    /*
     * === Methods ===
     */
    didInsertElement: function() {
        var self = this;

        this.updateChecked();
        this.$().attr('tabindex', '-1');
        // Add event listener
        this.$().on('hidden.bs.modal', function() {

            Ember.run( function() {

                // Reset modal content
                self.set('is-visible', false);
            });
        });
    },

    willDestroyElement: function() {
        this.$().off('hidden.bs.modal');
    },

    updateChecked: Ember.observer('selected-question-types', function() {
        var selected = this.get('selected-question-types');

        if ($.isArray(selected)) {
            this.$('input[type="checkbox"]').each( function() {
                var $this = $(this);
                if (selected.indexOf($this.val()) !== -1) {
                    $this.attr('checked', 'checked');
                }
            });
        }

    }),

    actions: {

        sendSelection: function() {
            var codes = this.$("input[type='checkbox']:checked").map(function () {
                return $(this).val();
            }).toArray();

            // Hide the modal
            this.$().modal("hide");

            // Send event to target
            this.sendAction('on-apply', codes);
        }
    }

});
