import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import context from 'utils/context-utils';

export default Controller.extend(
    ControllerMixin, {

    instructor: Ember.inject.controller(),
    student: Ember.inject.controller(),
    /**
     * @property {Ember.A} alias of current instructor classes from injected class controller
     */
    instructorClasses : Ember.computed.alias("instructor.activeClasses"),

    /**
     * @property {Ember.A} alias of current student classes from injected class controller
     */
    studentClasses : Ember.computed.alias("student.classes"),

    /**
     * @property {Class[]} student classes
     */
    classes: Ember.computed("instructorClasses.[]", "studentClasses.[]", function(){
        var instructorClasses = this.get("instructorClasses");
        var studentClasses = this.get("studentClasses");

        if (!this.get("user")){ return Ember.A();}

        return (this.get("user").get("isInstructor")) ? instructorClasses : studentClasses;
    }),

    /**
     * @property string selected menu
     */
    menu: null,

    /**
     * @property int set Max length of the menu
     */
    maxLength: 55,

    isOpen: false,
    isMobile: false,
    isMobileMenuOpen: false,

    menuObserver: Ember.observer('menu', function(){
        this.activeHeaderMenu(this.get("menu"));
    }),


    controllerSetup: function () {
        var window_width = $(window).width();

        if (window_width <= 480) {
            this.set('isMobile', true);
        } else {
            this.set('isMobile', false);
        }
    }.on('init'),

    activeHeaderMenu: function (section) {
        $(".active").removeClass("active");
        $("." + section).addClass("active");
    },

    actions: {
        toggle_options: function () {
            //Toggle logout btn
            if (this.get('isOpen')) {
                this.set('isOpen', false);
                $('.username').removeClass('logout-active');
                $('.username_options').hide();
            } else {
                this.set('isOpen', true);
                $('.username').addClass('logout-active');
                $('.username_options').show();
            }

        },
        toogle_mob_menu: function () {
            //Toggle logout btn
            if (this.get('isMobileMenuOpen')) {
                this.set('isMobileMenuOpen', false);
                $('.mob-menu').removeClass('mob-menu-active');
                $('.mob-menu-opt').hide();
            } else {
                this.set('isMobileMenuOpen', true);
                $('.mob-menu').addClass('mob-menu-active');
                $('.mob-menu-opt').show();
            }
        },
        logout: function () {
            var authenticationManager = context.get('authenticationManager');
            authenticationManager.reset();
            this.transitionToRoute("index");

            // Karma does not support full page reload in its tests so we avoid
            // reloading the document if we're in the testing environment
            if (!context.isEnvironment('test')) {
                // Reload the document to reset the app instead of doing app.reset()
                // Faster and less prone to errors, per:
                // http://discuss.emberjs.com/t/is-application-reset-the-recommended-way-to-clear-caches-of-private-data-on-logout/5642/3
                window.location.reload();
            }
        },

        exitApp: function(){
            //Shows the exit Dialog - used only for framed version on mobile
            $('#exit-app').modal('show');
        }
    }

});
