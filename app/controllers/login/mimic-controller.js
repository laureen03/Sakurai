import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import LoginMixin from 'mixins/login';

export default Controller.extend(
    ControllerMixin,
    LoginMixin, {
    queryParams: ['refresh_token', 'publisher_name'],

    /**
     * @property {string} refresh token to perform authentication
     */
    refresh_token: "",

    /**
     * @property {string} publisher's name
     */
    publisher_name: ""

});