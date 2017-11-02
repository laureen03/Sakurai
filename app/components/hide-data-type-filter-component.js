/**
 * Component for updating a quiz filter on a chapter.
 *
 * @extends Ember.Component
 */

SakuraiWebapp.HideDataTypeFilterComponent = Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['chapter-filter'],
    classNameBindings: ['isInDevelopment:in-development', 'isSelected:selected'],

    checked: false,

    data: null,

    isInDevelopment: false,

    isSelected: false,

    // Stores the current selected chapters/taxonomies
    filterMap: null,

    /*
     * === OBSERVERS
     */
    setupFilter: function() {

        var self = this,
            dataPromise = Em.RSVP.hash({
                type: this.get('type'),
                instructor: this.get('instructor'),
                dataType: this.get('dataType')
            });

        self.set('data', dataPromise);
        var filterVarName = self.get("filterVarName");

        dataPromise.then( function(data) {
            if (self.isFilterEnabled(data.dataType.id)) {
                self.set('checked', true);
            }

            data.dataType.get(filterVarName).then( function(item) {
                item.forEach( function(item) {
                    item.get('instructor').then( function( filterAuthor ) {
                        var filterType = item.get('type');

                        if (data.instructor.get('isInstructor') &&
                            filterAuthor.get('isAdmin') &&
                            filterType == SakuraiWebapp.ChapterFilter.HIDDEN_FILTER) {
                            // If the filter is of type 'hidden', then mark it visually but do not alter
                            // its 'checked' status
                            self.set('isInDevelopment', true);
                        }


                        if ((filterType == data.type && filterAuthor.get('id') == data.instructor.get('id'))) {

                            self.sendAction('add', {
                                id: item.get('id'),
                                instructor: data.instructor,
                                dataType: data.dataType
                            });
                            self.set('checked', true);
                        }
                    });
                });

            });
        });
    }.on('init'),

    isFilterEnabled: function(id) {
        var filter = undefined;
        if (this.get('filterMap')) {
            filter = this.get('filterMap').findBy('dataType.id', id);
        }
        return filter !== undefined;
    },

    onChecked: Ember.observer('checked', function(element) {
        var self = this;

        if (element.isView) {
            // Only process ember events, and not the jquery events
            // fired along with the ember events.

            this.get('data').then( function(data) {

                if (self.get('checked')) {

                    Ember.Logger.debug(self.toString() + ': create filter');
                    //self.$().addClass('selected');
                    self.set('isSelected', true);
                    self.sendAction('add', data);

                } else {

                    Ember.Logger.debug(self.toString() + ': remove filter');
                    //self.$().removeClass('selected');
                    self.set('isSelected', false);
                    self.sendAction('remove', data);
                }

            });
        }
    }).on('change')
});
