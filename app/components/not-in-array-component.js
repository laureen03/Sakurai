SakuraiWebapp.NotInArrayComponent = Ember.Component.extend({
	item : null,
	array : null,
	classNames: ['pull-left'],

	notInArray: Ember.computed("item", "array", function(){  
		var myArray;
		if (this.get("array") == undefined)
			return true;

		if (this.get("array") instanceof Array) {
		  myArray = this.get("array");
		} else {
		  myArray = this.get("array").split("-");
		}
   		return ($.inArray(this.get("item"), myArray) === -1) //Check if the V1 is not in the array
	})
});