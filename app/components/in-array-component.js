SakuraiWebapp.InArrayComponent = Ember.Component.extend({
	item : null,
	array : null,
	classNames: ['pull-left'],

	inArray: Ember.computed("item", "array", function(){
		var myArray;
		if (this.get("array") == undefined)
			return false;

		if (this.get("array") instanceof Array) {
		  myArray = this.get("array");
		} else {
		  myArray = this.get("array").split("-");
		}
		
   		return ($.inArray(this.get("item"), myArray) !== -1) //Check if the V1 is on the array
	})
});