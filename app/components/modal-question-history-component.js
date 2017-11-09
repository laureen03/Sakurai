/**
 * Component for displaying a modal with events regarding a specific question
 *
 * @extends Ember.Component
 *
 */
import Ember from "ember"; 
import QuestionAudit from "models/question-audit";

export default Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['modal-question-history', 'modal', 'fade'],
    classNameBindings: ['component-class'],

    /*
     * @property {string} special class to add to the component's tag (optional)
     */
    'component-class': '',

    /*
     * @property {string} should the modal be visible or hidden?
     */
    'is-visible': '',

    /*
     * @property {QuestionAudit[]} list of audit events for a specific question
     */
    'audit-events': null,

    /*
     * @property {bool} is the information ready to be rendered in the template
     */
    _isHistoryLoaded: false,

    /*
     * @property {Ember.A} array of items rendered in the template
     */
    _auditItems: null,

    /*
     * === Methods ===
     */
    didInsertElement: function() {
        var self = this;

        // Add event listener
        this.$().on('hidden.bs.modal', function() {

            Ember.run( function() {
                // Reset modal content
                self.set('is-visible', false);
                self.set('_isHistoryLoaded', false);
                self.set('_auditItems', null);
            });
        });
    },

    willDestroyElement: function() {
        this.$().off('hidden.bs.modal');
    },

    /*
     * === Observers ===
     */
    controlVisibility: Ember.observer('is-visible', function() {
        if (this.get('is-visible')) {
            this.$().modal("show");
        } else {
            this.$().modal("hide");
        }
    }),

    prepareDataForTemplate: Ember.observer('audit-events', function() {
        var auditEvents = this.get('audit-events'),
            self = this,
            items;


        items = auditEvents.map( function(auditEvent) {
            return auditEvent.get('createdBy').then( function(user) {
                var displayLabel = '',
                    action = QuestionAudit.getAction(auditEvent.get('action')),
                    username = user ? user.get('fullNameInformal'): null,
                    isMajorEdit = auditEvent.get('isMajorEdit'),
                    majorEditLabel = auditEvent.get('majorEditLabel');
                displayLabel += action.label + ' ';
                if (isMajorEdit) {
                    displayLabel += majorEditLabel + ' ';
                }
                if (username) {
                    displayLabel += I18n.t('common.by') + ' ' + username + ' ';
                }
                displayLabel += I18n.t('common.on') + ' ';
                return {
                    date: auditEvent.get('date'),
                    detail: auditEvent.get('detail'),
                    isNoteAdded: auditEvent.get('isNoteAdded'),
                    label: displayLabel
                };
            });
        });

        Ember.RSVP.Promise.all(items).then( function(itemsArray) {

            var items = Ember.A(itemsArray);

            // Date has been resolved and sorted. It is ready to be rendered
            // in the template
            self.set('_auditItems', items.sortBy('date').reverse());
            self.set('_isHistoryLoaded', true);
        });

    })

});
