import Ember from 'ember';
import context from 'sakurai-webapp/utils/context';

export default Ember.Object.extend({

    // supported routes
    routes: Ember.computed(function(){
        return {
            "editClass": "getEditClassRoute",
            "studentRoster": "getStudentRosterRoute",
            'manageClasses': "getManageClassesRoute",
            'newClass' : "getNewClassRoute",
            'addInstructor': "getAddInstructorRoute",
            'joinClass': "getJoinClassRoute",
            'studentManageClasses': "getStudentManageClassesRoute"
        };
    }),

    /**
     * Gets the route assign to the ccm key
     * @param ccmKey
     * @param params
     * @returns {string} route
     */
    getRoute: function(ccmKey, params){
        var helper = this;
        var route = null;
        if (helper.isValidRoute(ccmKey)){
            var routeFunctionName = helper.getRouteFunctionName(ccmKey);
            route = helper[routeFunctionName](params);
        }

        return route;
    },

    /**
     * Indicates when it is valid route
     * @param ccmKey
     * @returns {bool}
     */
    isValidRoute: function(ccmKey){
        return (this.getRouteFunctionName(ccmKey) !== undefined);
    },

    /**
     * Returns the route function name
     * @param {string} ccmKey
     * @returns {string} function name
     */
    getRouteFunctionName: function(ccmKey){
        return this.get("routes")[ccmKey];
    },

    /**
     * Gets the base route
     * @param params
     */
    getBaseRoute: function(params){
        var lwwProperties = context.get("environment").getProperty("lww");
        var thePointUrl = lwwProperties.baseUrl + lwwProperties.ccmUrlPath;
        return  thePointUrl + params.isbn;
    },

    /**
     * Get edit class ccm route
     * @param {{}} params
     * @returns {string} route
     */
    getEditClassRoute: function(params){
        var baseRoute = this.getBaseRoute(params);
        return baseRoute + "?focus=cm&ccmtarget=editclass&courseid=" + params.class.get("externalId");
    },

    /**
     * Get student roster ccm route
     * @param {{}} params
     * @returns {string} route
     */
    getStudentRosterRoute: function(params){
        var baseRoute = this.getBaseRoute(params);
        return baseRoute + "?focus=cm&ccmtarget=roster&courseid=" + params.class.get("externalId");
    },

    /**
     * Get manage classes ccm route
     * @param {{}} params
     * @returns {string} route
     */
    getManageClassesRoute: function(params){
        var baseRoute = this.getBaseRoute(params);
        return baseRoute + "?focus=cm&ccmtarget=teaching";
    },
    /**
     * Get create class ccm route
     * @param {{}} params
     * @returns {string} route
     */
    getNewClassRoute: function(params){
        var baseRoute = this.getBaseRoute(params);
        return baseRoute + "?focus=cm&ccmtarget=createclass";
    },

    /**
     * Get add instructor ccm route
     * @param {{}} params
     * @returns {string} route
     */
    getAddInstructorRoute: function (params) {
        var baseRoute = this.getBaseRoute(params);
        return baseRoute + "?focus=cm&ccmtarget=addcoinstructor&courseid=" + params.class.get("externalId");
    },

    /**
     * Get create class ccm route
     * @param {{}} params
     * @returns {string} route
     */
    getJoinClassRoute: function(params){
        var baseRoute = this.getBaseRoute(params);
        return baseRoute + "?focus=cm&ccmtarget=joinclass";
    },

    /**
     * Get create class ccm route
     * @param {{}} params
     * @returns {string} route
     */
    getStudentManageClassesRoute: function(params){
        var baseRoute = this.getBaseRoute(params);
        return baseRoute + "?focus=cm&ccmtarget=enrolled";
    }
});