import DS from 'ember-data';

export default DS.Model.extend({
	/**
	* @property {Question} Current Question Information
	**/
    question: DS.belongsTo('question', { async: true }),
    /**
	* @property {Result} Have Information about result, if is correct or not
	**/
    result: DS.belongsTo('result', { async: true }),
});
