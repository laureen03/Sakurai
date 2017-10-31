import Ember from "ember";

export default Ember.Helper.helper(function(params) {
	// params = [0]-> text, [1] -> maxLegth, [2] -> textCut
	var text = params[0], 
		maxLegth = params[1], 
		textCut = params[2];

	if (text && (text.length > maxLegth)) {
		text = text.substring(0, maxLegth);
		if (textCut){
			return text + "...";
		}
		else{
			var end;
			end = text.lastIndexOf(" "); 
			return text.substring(0, end) + "...";	
		}
	}
	else{
		return text;
	}
});