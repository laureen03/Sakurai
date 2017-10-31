import DS from 'ember-data';
import Ember from "ember";
import QuestionAudit from "../models/question-audit";

export default DS.Model.extend({

    /**
     * @property {string} Code/name of the audited action
     */
    action: DS.attr('string'),

    /**
     * @property {User.id} User who performed the action
     */
    createdBy: DS.belongsTo('user', { async: true }),

    /**
     * @property {Date} Date when the action was carried out
     */
    date: DS.attr('date'),

    /**
     * @property {string} Additional information about the action performed
     */
    detail: DS.attr('string'),

    isNoteAdded: Ember.computed('action', function(){
        return this.get('action') === QuestionAudit.NOTE_ADDED;
    }),

    isMajorEdit: Ember.computed('action', function(){
        return this.get('action') === QuestionAudit.MAJOR_EDIT;
    }),

    majorEditLabel: Ember.computed('detail', 'isMajorEdit', function(){
        return this.get('isMajorEdit') ? this.get('detail').replace("Reference question id:", "") : '';
    }),

});


QuestionAudit.reopenClass({

    CREATED : 'created',
    EDITED : 'edited',
    MAJOR_EDIT : 'major_edit',
    STATUS_CHANGED : 'status_changed',
    FILTER_CHANGED : 'filter_changed',
    FILTER_DELETED : 'filter_deleted',
    NOTE_ADDED: 'note_added',

    /**
     * Get an action object from an action code
     * @param {string} action from the list above
     * @returns {Object}
     */
    getAction: function(action) {
        var actions = QuestionAudit.actions(),
            i = actions.length - 1,
            result = null,
            actionObj;

        for (; i >= 0; i--) {
            actionObj = actions[i];

            if (actionObj.name === action) {
                result = actionObj;
                break;
            }
        }
        return result;
    },

    /**
     * Returns an array of objects of the form:
     * - name: name/code of the audited action
     * - label: text label for the audited action
     * @returns { [] }
     */
    actions: function(){
        return [
            {
                name: QuestionAudit.CREATED,
                label: I18n.t('common.actions.created')
            },
            {
                name: QuestionAudit.STATUS_CHANGED,
                label: I18n.t('common.actions.statusChanged')
            },
            {
                name: QuestionAudit.MAJOR_EDIT,
                label: I18n.t('common.actions.majorEdit')
            },
            {
                name: QuestionAudit.FILTER_DELETED,
                label: I18n.t('common.actions.filterDeleted')
            },
            {
                name: QuestionAudit.FILTER_CHANGED,
                label: I18n.t('common.actions.filterChanged')
            },
            {
                name: QuestionAudit.EDITED,
                label: I18n.t('common.actions.edited')
            },
            {
                name: QuestionAudit.NOTE_ADDED,
                label: I18n.t('common.actions.noteAdded')
            }
        ];
    }

});

