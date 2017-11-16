import Ember from "ember";
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import LoginMixin from 'sakurai-webapp/mixins/login';

export default Ember.Controller.extend(
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