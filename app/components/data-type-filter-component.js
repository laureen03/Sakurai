/**
 * Component for displaying a quiz filter on a chapter.
 *
 * @extends Ember.Component
 */

import Ember from "ember"; 
import ChapterFilter from "models/chapter-filter";

export default Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['chapter-filter'],
    classNameBindings: ['isInDevelopment:in-development', 'isSelected:selected'],
    data: null,
    isInDevelopment: false,
    isSelected: false,

    /*
     * === OBSERVERS
     */
    setupFilter: function() {

        var self = this,
            dataPromise = Ember.RSVP.hash({
                type: this.get('type'),
                instructor: this.get('instructor'),
                dataType: this.get('dataType')
            });

        self.set('data', dataPromise);
        var filterVarName = self.get("filterVarName");

        dataPromise.then( function(data) {
            data.dataType.get(filterVarName).then( function(item) {
                item.forEach( function(item) {
                    item.get('instructor').then( function( filterAuthor ) {
                        var filterType = item.get('type');

                        if (data.instructor.get('isInstructor') &&
                            filterAuthor.get('isAdmin') &&
                            filterType === ChapterFilter.HIDDEN_FILTER) {
                            // If the filter is of type 'hidden', then mark it visually but do not alter
                            // its 'checked' status
                            self.set('isInDevelopment', true);
                        }
                        if ((filterType === data.type && filterAuthor.get('id') === data.instructor.get('id'))) {
                            self.set('isSelected', true);
                        }
                    });
                });

            });
        });
    }.on('init'),

    /*
     * === ACTIONS
     */
    actions: {

        selectDataType: function(dataTypeId) {
            this.sendAction('select', dataTypeId);
        }
    }
});
