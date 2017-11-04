SakuraiWebapp.LoginSsoController = Ember.Controller.extend(SakuraiWebapp.ControllerMixin, SakuraiWebapp.LoginMixin, {
	queryParams: ['token', "product", "deepLinkingKey", "chapterId", "classId", "studentId", "viewMode", "templateId"],

    /**
     * @property string indicates what token is coming from LWW
     */
    token: "",

    /**
     * @property string product isbn
     */
    product: "",

    /**
     * @property {string} deep linking key indicating which route to hit
     */
    deepLinkingKey: null,

    /**
     * @property {number} chapter identifier
     */
    chapterId: null,

    /**
     * @property {string} student identifier
     */
    studentId: null,

    /**
     * @property {string} class identifier
     */
    classId: null,

    /**
     * This parameter could be null, two posible values for this are "texas_nursing_concepts” ó "alabama_nursing_concepts"
     **/
    templateId: null,
    
    /**
     * Indicates the view mode for the sso
     * Possible values Student, Instructor
     * student is used for instructor to switch to the student view
     * @property {string}
     */
    viewMode: null,

    /**
     * Indicates if deep linking is enable
     */
    deepLinkingEnable: Ember.computed('deepLinkingKey', function(){
        return this.get("deepLinkingKey") != null;
    }),


    /**
     * Indicates if the sso request is for student view
     * @property {bool}
     */
    isStudentView: Ember.computed('viewMode', function(){
        return this.get("viewMode") == "student";
    }),

    /**
     * Redirects the user to the requested route
     * @param {{}} data
     */
    deepLinkingTo: function (data) {
        var controller = this;
        var classes = data.classes;
        //sets the transition params
        var params = {
            classes: classes,
            product : data.product,
            chapter : data.chapter,
            student : data.student
        };

        var helper = SakuraiWebapp.DeepLinkingHelper.create({});
        var deepLinkingKey = controller.get("deepLinkingKey");
        var route = helper.getRoute(deepLinkingKey, params);
        if (route) {
            controller.replaceRoute(route);
        }
        else {
            //default route
            controller.afterAuthenticate(classes.get("length"), classes, true);
        }
    },

    /**
     * Handles switching to student view
     * @param classes
     */
    afterAuthenticateStudentView: function(classes){
        var controller = this;
        var context = SakuraiWebapp.context;
        var authenticationManager = context.get('authenticationManager');

        var classId = authenticationManager.getClassFromStorage();
        var validClass = $.inArray(classId, classes) >= 0;
        if (validClass){
            controller.replaceRoute("student.haid", classId);
        }
        else{
            controller.replaceRoute("student.class");
        }

    }
});