import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
    ResetScroll,{

    controllerName: 'profile',

    renderTemplate: function() {
        this.render('profile');
    },

    model: function() {
        var authenticationManager = context.get('authenticationManager'),
            userId = authenticationManager.getCurrentUserId();

        return this.store.find('user', userId);
    },

    setupController: function(controller, model) {
        controller.set('user', model);
        // Unbind these values from the model; otherwise, any changes to the first
        // and last name will be reflected on the user's name in the menu
        controller.set('firstName', model.get('firstName'));
        controller.set('lastName', model.get('lastName'));
    },

    deactivate: function () {
        var controller = this.get('controller');

        controller.cleanPasswordValues();
    }

});
