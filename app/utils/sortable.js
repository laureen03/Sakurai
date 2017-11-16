import Ember from "ember"; 

export default Ember.Component.extend({

    /**
     * @property {string} sort by
     */
    sort: null,

    /**
     * @property {bool} direction, asc=true, desc=false
     */
    direction: false,

    /**
     * @property {Ember.A} data items
     */
    data: Ember.A(),

    /** 
     * @property {string} property name for which at least one of the elements in the data
     * must have a truthy value; otherwise, the SortableHelper is considered to be empty
     * (hasElements property would be equal to false). If mandatoryProperty is not defined,
     * then what determines if the SortableHelper has elements or not, is the data length.
     */
    mandatoryProperty: null,

    collection: Ember.computed('data.[]', 'sort', 'direction', function(){
        var data = this.get("data");
        var sort = this.get("sort");
        var direction = this.get("direction");
        return (direction) ?
            data.sortBy(sort) : //asc
            data.sortBy(sort).reverse(); //desc
    }),

    hasElements: Ember.computed('data.[]', 'mandatoryProperty', function(){
        var mandatoryProperty = this.get('mandatoryProperty'),
            data = this.get('data'),
            found;

        if (mandatoryProperty) {
            found = data.find( function(item) {
               return item.get(mandatoryProperty);
            });
            // Were items found with the mandatory property?
            return found;
        } else {
            return data.length > 0;
        }
    })

});
