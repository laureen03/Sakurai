/**
 * Component for displaying/updating a filter on a question.
 *
 * @extends Ember.Component
 *
 * @param question {Question} question to apply the filter to
 * @param product {Product} product this question belongs to
 * @param user {User} instructor setting/editing the filter
 * @param type {string} type of filter used on the question filter
 * @param label {string} text label to show next to the filter checkbox
 * @param create {string} controller action responsible for creating the question filter
 * @param delete {string} controller action responsible for removing the question filter
 */
 
import Ember from "ember"; 

export default Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'label',

    classNames: ['question-filter', 'btn', 'btn-default', 'pull-left'],

    checked: false,
    ready: false,
    data: null,
    filterId: null,
    "data-store": null,

    setupFilter: function() {
        var self = this,
            dataPromise = Ember.RSVP.hash({
                question: this.get('question'),
                product: this.get('product'),
                instructor: this.get('user'),
                type: this.get('type')
            });

        this.set('data', dataPromise);

        dataPromise.then( function(data) {

            data.question.get('questionFilters').then( function(questionFilters) {
                var promises = questionFilters.map(function(filter){
                    return filter.get("resolve");
                });
                Ember.RSVP.all(promises).then(function(){
                    questionFilters.forEach( function(filter) {
                        if ( self.isFilterFound(filter, data) ) {
                            self.set('checked', true);
                            self.set('filterId', filter.get('id'));
                        }
                    });

                    // Ready to start processing 'check' events on the checkbox
                    self.set('ready', true);
                });
            });
        });
    }.on('init'),

    /*
     * === OBSERVERS
     */
    updateFilter: Ember.observer('question.questionFilters', function() {
        var self = this;

        // Reset the filterId value
        this.set('filterId', null);

        if (this.get('checked')) {
            // Update the filterId value
            this.get('data').then( function (data) {

                data.question.get('questionFilters').then( function(questionFilters) {
                    var promises = questionFilters.map(function(filter){
                        return filter.get("resolve");
                    });
                    Ember.RSVP.all(promises).then(function(){
                        questionFilters.forEach( function(filter) {
                            if ( self.isFilterFound(filter, data) ) {
                                self.set('filterId', filter.get('id'));
                            }
                        });
                    });
                });
            });
        }
    }),

    isFilterFound: function (filter, data) {

        // Check if the filter applies to this product. We may be looking at
        // questions with the same ID (e.g. 2155), but related to different
        // products. Also, check if the current user is the same instructor
        // that originally set the filter. If not, the checkbox should not be checked.

        //some filters could not have instructor
        var hasInstructor = (filter.get('instructor') && data.instructor);
        var instructorOk =  hasInstructor && (filter.get('instructor').get('id') === data.instructor.get('id'));

        return ( filter.get('type') === data.type &&
                 filter.get('product').get('id') === data.product.get('id') &&
                 instructorOk );
    },

    onChecked: Ember.observer('checked', function(element) {
        var isReady = this.get('ready'),
            self = this,
            store = self.get("data-store");

        if (isReady && element.isView) {
            // Only process ember events, and not the jquery events
            // fired along with the ember events.

            // Disable the checkbox until things are resolved in the server
            this.$('input').attr('disabled', true);
            
            if (this.get('checked')) {

                this.get('data').then( function(data) {
                    Ember.Logger.debug(self.toString() + ': create question filter');
                    
                    var record = store.createRecord('questionFilter', data);
                    record.save().then(function(){
                        // Re-enable the checkbox after updating the changes in the model
                        this.$('input').removeAttr('disabled');
                    });
                });

            } else {
                Ember.Logger.debug(self.toString() + ': remove question filter');
                
                var filterId = self.get('filterId');
                store.find('questionFilter', filterId).then(function (record) {
                    Ember.Logger.debug(self.toString() + ': deleting question filter with id: ', filterId);
                    store.deleteRecord(record);
                    record.save().then(function(){
                        // Re-enable the checkbox after updating the changes in the model
                        this.$('input').removeAttr('disabled');
                    });
                });

            }

            // Stop propagation for this event
            return false;
        }
    }).on('change')

});
