import DS from "ember-data";

export default DS.RESTAdapter.extend({
	host: 'https://sakurai-api-uat.prep-u.com/',
	namespace: '1'
});