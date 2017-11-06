import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
    ResetScroll,{

    setupController: function(controller) {
        var authenticationManager = context.get('authenticationManager');
        var publisher = authenticationManager.getCurrentPublisher();
        var user = authenticationManager.getCurrentUser();
        controller.setDefaultValues(user.get('id'), publisher.get('id'));
    }

});