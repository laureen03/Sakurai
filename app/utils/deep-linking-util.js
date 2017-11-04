import Ember from 'ember';

export default Ember.Object.extend({

    // supported routes
    routes: Ember.computed(function(){
        return {
            "aml": "getAssignMasteryLevelRoute",
            "assignMasteryLevel": "getAssignMasteryLevelRoute",
            'question_library': "getQuestionLibraryRoute",
            'ql' : "getQuestionLibraryRoute",
            'take_practice_quiz': "getTakePracticeQuizRoute",
            'tpq': "getTakePracticeQuizRoute",
            'class_for_instructor_view': "getInstructorClassRoute",
            'cfi': "getInstructorClassRoute",
            'student_for_instructor_view': "getInstructorStudentClassResultsRoute",
            'sfi': "getInstructorStudentClassResultsRoute",
            'class_for_student_view': "getStudentClassRoute",
            'sfs' : "getStudentClassRoute"
        };
    }),

    /**
     * Gets the route assign to the deep linking key
     * @param deepLinkingKey
     * @param params
     * @returns {string} route
     */
    getRoute: function(deepLinkingKey, params){
        var helper = this;
        var route = null;
        if (helper.isValidRoute(deepLinkingKey)){
            var routeFunctionName = helper.getRouteFunctionName(deepLinkingKey);
            route = helper[routeFunctionName](params);
        }

        return route;
    },

    /**
     * Indicates when it is valid route 
     * @param deepLinkingKey
     * @returns {bool}
     */
    isValidRoute: function(deepLinkingKey){
        return (this.getRouteFunctionName(deepLinkingKey) !== undefined);
    },

    /**
     * Returns the route function name
     * @param {string} deepLinkingKey
     * @returns {string} function name
     */
    getRouteFunctionName: function(deepLinkingKey){
        return this.get("routes")[deepLinkingKey];
    },

    /**
     * Assign mastery level route
     * @param params
     */
    getAssignMasteryLevelRoute: function(params){
        var classes = params.classes;
        if (!classes || classes.get("length") === 0){
            return null;
        }
        //using the first class by default if not provided
        var classId = classes.nextObject(0).get("id");
        var chapterId = params.chapter.get("id");

        var route = "/instructor/manageAssignment/" + classId + "/0";
        if (chapterId){
            route = route + "?chapterId=" + chapterId;
        }

        return route;
    },

    /**
     * Assign mastery level route
     * @param params
     */
    getQuestionLibraryRoute: function(params){
        var classes = params.classes;
        if (!classes || classes.get("length") === 0){
            return null;
        }
        //using the first class by default if not provided
        var classId = classes.nextObject(0).get("id");
        var chapterId = params.chapter.get("id");

        var route = "/instructor/library/results/" + classId;
        if (chapterId){
            route = route + "?cid=" + chapterId;
        }

        return route;
    },

    /**
     * Take practice quiz route
     * @param params
     */
    getTakePracticeQuizRoute: function(params){
        var classes = params.classes;
        if (!classes || classes.get("length") === 0){
            return null;
        }
        //using the first class by default if not provided
        var classId = classes.nextObject(0).get("id");
        var chapterId = params.chapter.get("id");

        var route = "/student/section/" + classId;
        if (chapterId){
            route = route + "?cs=" + chapterId;
        }

        return route;
    },


    /**
     * Instructor HMCD route
     * @param params
     */
    getInstructorClassRoute: function(params){
        var classes = params.classes;
        if (!classes || classes.get("length") === 0){
            return null;
        }
        //for instructor HMCD the first class is the one specified as parameter, @see sso_route.js
        var classId = classes.nextObject(0).get("id");
        return "/instructor/hmcd/" + classId;
    },
    
    /**
     * Instructor accessing student class results route
     * @param params
     */
    getInstructorStudentClassResultsRoute: function(params){
        var classes = params.classes;
        var student = params.student;
        if (!classes || classes.get("length") === 0 || !student){
            return null;
        }
        //for instructor HMCD the first class is the one specified as parameter, @see sso_route.js
        var classId = classes.nextObject(0).get("id");
        return "/student/haid/" + classId + "?studentId=" + student.get("id");
    },

    /**
     * Student accessing the HAID page
     * @param params
     */
    getStudentClassRoute: function(params){
        var classes = params.classes;
        if (!classes || classes.get("length") === 0){
            return null;
        }
        var classId = classes.nextObject(0).get("id");
        return "/student/haid/" + classId;
    }
});