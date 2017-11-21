/**
 * This class configures the application environment, like properties
 * @type {Environment}
 */
import Ember from "ember";
import ApplicationAdapter from "sakurai-webapp/adapters/application";
import AuthKeyAdapter from "sakurai-webapp/adapters/auth-key";

export default Ember.Object.extend({

    /**
     * @property {Object} default environment properties
     * This property is inherited by all classes that extend from it
     * (e.g. SakuraiWebapp.DevelopmentEnvironment). To override or
     * extend this property, another property is available named
     * 'propertiesOverrides' which should be used by these classes
     * instead.
     */
    properties: {

        restAdapter:{
            namespace: 'app.php/1'
        },

        logLevels: [],

        session: {
            inactivityCountdown: 3600,  // seconds (i.e. 1 hour)
            logoutCountdown: 30         // seconds
        },

        quizzer: {
            animationTimeout: 5000
        },

        lww: {
            baseUrl: "http://thepoint1.technotects.com",
            ccmUrlPath: "/Book/isbn/",
            referenceUrlPath: "/vitalsource/display/",
            contentUrlPath: "/MyContent"
        },
        toggle:{ //Functionality for Toggle for features can be "turned on"
            staggeredAssignment: 1,
            copyAssignments: 1,
            studentUsageDownload: 1,
            practiceExamResultsDownload: 1,
            shareQuestionCollection: 1,
            assignmentRelatedQuizzes: 1,
            referenceViews: 1,
            filterByDifficulty: 1
        }
    },

    init:function(){

        this.setupProperties();

        // App Adapters
        this.setupAdapters();

        // App Serializers
        this.setupSerializers();

    },

    setupProperties: function() {
        var properties = this.get('properties'),
            overrides = this.get('propertiesOverrides'),
            local = this.get("localProperties");

        $.extend(true, properties, overrides);
        $.extend(true, properties, local);
        this.set('properties', properties);
    },

    localProperties: Ember.computed( function(){
        return window.SAKURAI_LOCAL_PROPS || {}; //global variable or empty
    }),

    /**
     * Setups application serializers
     */
    setupSerializers: function(){
        //App Serializer
        SakuraiWebapp.ApplicationSerializer = SakuraiWebapp.SakuraiSerializer;
    },

    /**
     * Setups the custom application adapters
     */
    setupAdapters: function(){
        var props = this.get('properties');

        //Configures the application adapter for models
        ApplicationAdapter.reopen({
            host: props.restAdapter.host,
            namespace: props.restAdapter.namespace,
            shouldBackgroundReloadRecord:function() {
                return false;
            }
        });

        //Configures the custom adapter for AuthKey model
        AuthKeyAdapter.reopen({
            host: props.restAdapter.host,
            namespace: props.restAdapter.namespace
        });

    },

    getProperty: function(key){
        var props = this.get('properties');
        return props[key];
    }
});
