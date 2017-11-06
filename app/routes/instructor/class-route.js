import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
    ResetScroll,{

    setupController: function() {
        var authenticationManager = context.get('authenticationManager');
        authenticationManager.clearCurrentClass(); //removing the current class for instructors
    }

});