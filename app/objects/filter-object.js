
import Ember from 'ember';

export default Ember.Object.extend({

    dataTypeId: Ember.computed.alias('dataType.id'),

    id: null,

    type: null,

    instructor: null,

    dataType: null,

    doesExist: Ember.computed.bool('id'),

    willRemove: false,

    add: function() {
        this.set('willRemove', false);
    },

    remove: function() {
        this.set('willRemove', true);
    }
});