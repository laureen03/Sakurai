import Ember from 'ember';
import AuthenticationManager from "sakurai-webapp/utils/authentication-manager";
import DevelopmentEnvironment from 'sakurai-webapp/environment/development';
import TestingEnvironment from 'sakurai-webapp/environment/testing';
import ProductionEnvironment from 'sakurai-webapp/environment/production';

/**
 * This class is used to control the application context
 * This is not a global variable storage, a few thing should go here. i.e authentication manager
 * @type {ApplicationContext}
 */
export default Ember.Object.extend({

    /**
     * @property {string} defines the application environment mode
     */
    mode: "dev",

    /**
     * @property {object} map of possible application environment modes
     */
    modes: {
        DEV: "dev", //grunt serve
        PROD: "prod", //on production
        TEST: "test", //when doing grunt test
        FIXTURE: "fixture", //when doing grunt serve:fixture
        VAGRANT: "vagrant",// grunt serve:vagrant
        UAT: "uat" //grunt serve:uat
    },

    /**
     * @property {AuthenticationManager} authentication manager
     */
    authenticationManager: null,

    /**
     * @property {SakuraiWebapp.Environment} application environment
     */
    environment: null,

    /**
     * @property {string} indicates the current application module
     */
    applicationModule : null,


    /**
     * @property {string} indicates the previous application module
     */
    prevApplicationModule : null,


    /**
     * @property {bool} indicates how many resize has occurred,
     * this is just an indicator to know when the window size was changed
     *
     */
    resizeCount : 0,

    /**
     * Indicates if the application is in a frame
     * @property {bool}
     */
    isInFrame: false,

    /**
     * Indicates if the application is in a mobile device
     * @property {bool}
     */
    isInMobile: false,

    /**
     * Indicates when the application is loading data
     */
    isLoading: false,

    setLoadingValue: function(value) {
       this.set("isLoading", value);
    },

    init:function(){
        this._initAuthenticationManager();
        this._initEnvironment();
        this._initWindowResizeListener();
        this._initLogger(this.get("environment"));
    },

    /**
     * Redefines the ember logger to enable or disable levels
     */
    _initLogger: function(environment){
        var allowedLevels = environment.getProperty('logLevels');
        $.each(["debug", "info", "warn", "log", "error"], function(index, logLevel){
            if ($.inArray(logLevel, allowedLevels) < 0){ //not allow
                Ember.Logger[logLevel] = function(){};
            }
        });
    },

    _initWindowResizeListener: function(){
        var context = this;
        $(window).bind('resize', function(){
            var count = context.get("resizeCount");
            context.set("resizeCount", ++count);
        });
    },

    /**
     * Initializes the authentication manager
     * @private
     */
    _initAuthenticationManager: function(){
        this.authenticationManager = AuthenticationManager.create({});
    },

    /**
     * Initializes then application environment
     * @private
     */
    _initEnvironment: function(){
        var environment = null,
            mode = this.get('mode'),
            modes = this.get('modes');

        if (mode === modes.PROD){
            environment = ProductionEnvironment.create({});
        }
        else if (mode === modes.DEV){
            environment = DevelopmentEnvironment.create({});
        }
        else if (mode === modes.FIXTURE){
            //environment = SakuraiWebapp.FixtureEnvironment.create({});
        }
        else if (mode === modes.TEST){
            environment = TestingEnvironment.create({});
        }
        else if(mode === modes.UAT){
            //environment = SakuraiWebapp.UatEnvironment.create({});
        }
        this.set('environment', environment);
    },

    /**
     * Gets the base url
     * @returns {string}
     */
    getBaseUrl: function () {
        var environment = this.get("environment");
        var restAdapter = environment.getProperty("restAdapter");
        var host =  restAdapter.host || "";
        return host + "/" + restAdapter.namespace;
    },

    /**
     * Gets the base url
     * @returns {string}
     */
    getToggleVersion: function(module){
        var environment = this.get("environment");
        var toogle = environment.getProperty("toggle");
        return toogle[module];
    },

    /**
     * Adds a window resize listener
     * @param callback
     */
    addWindowResizeListener: function(callback){
        this.addObserver("resizeCount", callback);
    },

    /**
     * Check the current environment
     * @param environment {string} should be one of four possible strings: 'dev', 'prod', 'test' or 'vagrant'
     */
    isEnvironment: function(environment) {
        var mode = this.get('mode'),
            modes = this.get('modes'),
            found = false,
            str = [],
            i;

        for (i in modes) {
            if (environment === modes[i]) {
                found = true;
                break;
            }
        }

        if (found) {
            return (mode === environment);
        } else {
            for (i in modes) {
                str.push(modes[i]);
            }
            throw new Ember.Error('Invalid environment value: ' + environment + '. The only allowed environment values are: ' + str.join(', '));
        }
    },

    /**
     * Indicates if it is on testing mode
     * @returns {boolean}
     */
    isTesting: function(){
        var mode = this.get('mode');
        var modes = this.get('modes');
        return (mode === modes.TEST);
    },

    /**
     * Gets the application store
     * @returns {*}
     */
    getStore : function () {
        //akuraiWebapp.DevelopmentEnvironmentakuraiWebapp.DevelopmentEnvironment SakuraiWebapp.__container__.lookup('service:store');
    }

});
