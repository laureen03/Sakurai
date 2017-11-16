import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
    ResetScroll,{

    setupController: function() {
        var authenticationManager = context.get('authenticationManager');
        authenticationManager.clearCurrentClass(); //removing the current class for instructors
    }

});