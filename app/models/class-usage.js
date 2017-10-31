
import DS from 'ember-data';

export default DS.Model.extend({
    /**
     * @property questionsAnswered {number} total number of questions answered by all
     *           the students enrolled in a class
     */
    questionsAnswered: DS.attr('number'),
    /**
     * @property class {Class} class enrolled 
     *            
     */
    class: DS.belongsTo('class', { async: true }),
    /**
     * @property date {date} date of questions answered
     *           
     */
    date: DS.attr('date')

});
