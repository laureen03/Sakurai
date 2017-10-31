import Ember from 'ember';

export default Ember.Mixin.create({
    /**
     * Sorts a table by criteria
     * This is a default implementation, this could be override if necessary
     * @param sortableId the sortable identifier
     * @param criteria
     */
    sortByCriteria: function(sortableId, criteria){
        var controller = this;

        //it expects to have a variable in the controller like {sortableId}Sortable
        var sortable = controller.get(sortableId + "Sortable");

        //it expects a table element having the class {sortableId}-table
        var tableElement = $("." + sortableId + '-table');

        //it replaces any . in the criteria (i.e user.name) for _ (user_name)
        //it expects a column having a class .sort_{criteria}
        var criteriaSelector = ' .sort_' + criteria.replace(".", "_");

        var descending = $(criteriaSelector, tableElement).find('span').hasClass('headerSortUp');
        sortable.set('direction', descending);
        sortable.set('sort', criteria);

        if(descending){
            $('.headerSortUp', tableElement).removeClass('headerSortUp');
            $(criteriaSelector, tableElement).find('span').addClass('headerSortDown');
        }else{
            $('.headerSortUp', tableElement).removeClass('headerSortUp');
            $('.headerSortDown', tableElement).removeClass('headerSortDown');
            $(criteriaSelector, tableElement).find('span').addClass('headerSortUp');
        }
    }


});