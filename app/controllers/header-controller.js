SakuraiWebapp.HeaderController = Ember.Controller.extend(SakuraiWebapp.ControllerMixin, {


    /**
     * @property string selected menu
     */
    menu: null,

    menuObserver: Ember.observer('menu', function(){
        this._activeHeaderMenu(this.get("menu"));
    }),

    isMobile: false,

    controllerSetup: function () {
        var window_width = $(window).width();

        if (window_width <= 480) {
            this.set('isMobile', true);
        } else {
            this.set('isMobile', false);
        }


    }.on('init'),

    _activeHeaderMenu: function (menu) {
        $(".active").removeClass("active");
        $("." + menu).addClass("active");
    }

});
