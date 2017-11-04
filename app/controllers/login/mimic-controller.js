SakuraiWebapp.LoginMimicController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.LoginMixin, {
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