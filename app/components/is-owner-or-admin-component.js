/*
 * Workaround to determine whether a question's edit link should be shown or not.
 * If the question-partial is to be moved to its own component (with its own scope)
 * then this logic could be moved there and this helper could be removed.
 */

import Ember from "ember"; 
import context from "utils/context";

export default Ember.Component.extend({
	instructorId : null,
	isAuthoringEnabled : null,
	
	classNames: ['pull-left'],

	isOwnerOrAdmin: Ember.computed("instructorId", "isAuthoringEnabled", function(){
		var currentUserId = context.get('authenticationManager').getCurrentUserId();
        if (this.get("instructorId") === currentUserId || this.get("isAuthoringEnabled")) {
	        return true;
	    } else {
	        return false;
	    }
   	})
});