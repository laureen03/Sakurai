import Ember from 'ember';
import context from 'sakurai-webapp/utils/context';

export default Ember.Mixin.create({
	/**
     * Authenticate with the controller data
     * @param {number} totalClasses
     * @param {array} classes class ids
     */
    afterAuthenticate: function(totalClasses, classes){
        var controller = this;
        var context = Context;
        var authenticationManager = context.get('authenticationManager');

        var user = authenticationManager.getCurrentUser();
        var oneClass = totalClasses === 1;
        if (user.get("isStudent")){
            if (oneClass){
                controller.replaceRoute("student.haid", classes[0]);
            }
            else{
                controller.replaceRoute("student.class");
            }
        }
        else if (user.get("isInstructor")){
            if (oneClass){
                controller.replaceRoute("instructor.hmcd", classes[0]);
            }
            else{
                controller.replaceRoute("instructor.class");
            }
        }
        else if (user.get("isAdmin")){
            controller.replaceRoute("admin.products", 0);
        }
        else {
            Ember.Logger.warn("Role not supported: " + user.get("role"));
        }
        $('.main').scrollTop(0);
    }
});