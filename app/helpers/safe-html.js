import Ember from "ember";

export default Ember.Helper.helper(function(params) {
	if (params[0]!== undefined){
	    var html = $.htmlClean(params[0].toString(), {format: true});
	    return  new Ember.Handlebars.SafeString(html);
    }else{
    	return "";
    }
});
