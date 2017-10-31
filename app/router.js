import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

/*Router.reopen({
    
    notifyAdobeAnalytics: function() {
        var context = SakuraiWebapp.context;
        if (!context.isTesting()){
            // window.digitalData = digitalData || {};
            // only way to do this in ember < 2
            try {
                var currentRoute = SakuraiWebapp.__container__.lookup('controller:application').get('currentRouteName');
                var authenticationManager = context.get('authenticationManager'); 
                window.digitalData = {
                    page:{
                        pageInfo:{
                            pageName: currentRoute, 
                            // pageLoad:"1.2 ms",  // if available
                            domainName: document.location.host,
                            pageURL: this.get('url'),            
                            pageTitle: document.title

                        },
                        // category:{          
                        // },
                        attributes:{
                            businessUnit: "HLRP",
                            // contentType: "", // TBD
                            language: "EN",
                            division: "Health",
                            site: "Prep-U" //Mandatory. 
                        }
                    },
                    user: {
                        profile: {
                            userID: authenticationManager.getCurrentUserId() || '',
                            authenticationType: "SSO"
                        }
                    }
                };
                _satellite.track('New Page View');
            } 
            catch(e) {
                Ember.Logger.info("dtm tracking disabled");
            }
            // bubble up and always return true. we dont' want analytics to kill app
            return true; 
        }
    }.on('didTransition')
});*/

Router.map(function() {
	// Add your routes here
    this.resource('index', { path: '/'});

    /*Login Pages*/
    this.resource('login', function () {
        this.route('forgotPassword', {path: '/forgotPassword/'});
        this.route('sso', {path: '/sso/'});
        this.route('mimic', {path: '/mimic/'});
    });

    /*Quizzes*/
    this.resource('quiz', function () {
        this.route('start', {path: '/start/'});
        this.route('analyzing', {path: '/analyzing/'});
        this.route('quizzer', {path: '/quizzer/:id/:classId'});
        this.route('result', {path: '/result/:id/:classId'});
    });

    this.resource('exam', function () {
        this.route('create', {path: '/create/:classId'});
        this.route('result', {path: '/result/:id/:classId'});
    });

    this.resource('student', function () {
        this.route('haid', {path: '/haid/:classId'});
        this.route('examReports', {path: '/examReports/:classId'});
        this.route('class', {path: '/class'});
        this.route('enroll', {path: '/enroll'});
        this.route('assignments', {path: '/assignments/:classId'});
        this.route('assignment', {path: '/assignment/:classId/:assignmentId'});
        this.route('section', {path: '/section/:classId'});
        this.route('history', {path: '/history/:classId'});
        this.route('profile', {path: '/profile'});
        this.route('metadata', {path: '/metadata/:classId'});
        this.route('examHistory', {path: '/examHistory/:classId'});
    });

    this.resource('instructor', function () {
        this.route('hmcd', {path: '/hmcd/:classId'});
        this.route('questionLibrary', {path: '/questionLibrary/:classId'});
        this.route('manageAssignment', {path: '/manageAssignment/:classId/:assignmentId'});
        this.route('copyAssignments', {path: '/copyAssignments/:classId'});
        this.route('class', {path: '/class'});
        this.route('addEditClass', {path: '/addEditClass/:classId'});
        this.route('coInstructor', {path: '/coInstructor'});
        this.route('qcAssignmentSummary', {path: '/qcAssignmentSummary/:classId/:assignmentId'});
        this.route('assignmentSummary', {path: '/assignmentSummary/:classId/:assignmentId'});
        this.route('assignments', {path: '/assignments/:productId/:classId'});
        this.route('profile', {path: '/profile'});
        this.route('assignExam', {path: '/assignExam/:classId'});
        this.route('customizeExam', {path: '/customizeExam/:classId'});
        this.route('overallExamSettings', {path: '/overallExamSettings/:classId'});
        this.route('examSummary', {path: '/examSummary/:classId'});
        this.resource('library', {path: '/library'},  function () {
            this.route('home', {path: '/home/:classId'});
            this.route('results', {path: '/results/:classId/'});
            this.route('import', {path: '/import/:classId/:qsSource/:qsTarget'});
            this.route('dataTypeFilters', {path: '/dataTypeFilters/:classId/'});
            this.route('createQuestion', {path: '/createQuestion/:classId/:questionId'});
            this.route('selectQuestion', {path: '/selectQuestion/:classId'});
            this.route('export', {path: '/export/:classId/:qsId'});
        });
    });

    this.resource('admin', function () {
        this.route('products', {path: '/products/:classId'});
        this.route('profile', {path: '/profile'});
        this.route('rrSettings', {path: '/rrSettings/:classId'});
    });
});

export default Router;
