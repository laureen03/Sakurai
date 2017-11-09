import Ember from 'ember';
import FilterObject from 'objects/filter-object';

export default Ember.Object.extend({
 
    content: Ember.A(),

    addFilter: function(filterData) {
        var dataTypeId = filterData.dataType.get('id'),
            filterObject = this.findBy('dataTypeId', dataTypeId);

        Ember.Logger.debug(this.toString() + ': mark filter with id ' + dataTypeId + ' for addition');

        if (!filterObject) {
            filterObject = FilterObject.create(filterData);
            this.pushObject(filterObject);
        } else {
            filterObject.add();
        }
    },

    removeFilter: function(filterData) {
        var dataTypeId = filterData.dataType.get('id'),
            filterObject = this.findBy('dataTypeId', dataTypeId);

        if (filterObject) {
            Ember.Logger.debug(this.toString() + ': mark filter with id ' + dataTypeId + ' for removal');
            filterObject.remove();
        } else {
            throw new Ember.Error('FilterMap: cannot remove non-existant filter object');
        }
    }
});