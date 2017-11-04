SakuraiWebapp.InstructorPartialHmcdMisconceptionsController = Ember.Controller.extend(SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin, {

    instructorHmcd: Ember.inject.controller(),

    class: Ember.computed.alias('instructorHmcd.class'),

    /**
     * @property {classMisconceptions} list of questions that are misconceptions
     */
    classMisconceptions: null,

    /**
     * @property {bool}
     */
    hasClassMisconceptions: Ember.computed.notEmpty("classMisconceptions"),

    /**
    * Init Misconceptions Values
    **/
    initMisconceptions: function(misconceptions) { 
        this.set("classMisconceptions", misconceptions);
    },

    /**
     * Indicates if the remediation links area is enabled
     * @see FeatureMixin#isRemediationLinkAllowed
     * @property {bool}
     */
    remediationLinksEnabled: Ember.computed.bool("isRemediationLinkAllowed"),

    /**
     * Refreshes the misconception data, this shouldn't be necessary using the
     * unbound block helper which is not yet implemented by ember
     * Check PUSAK-1041
     * @see SakuraiWebapp.InstructorPartialHmcdStudentUsageController#showRemediationLinkViews
     */
    refreshMisconceptions: function(){
        var controller = this;
        var store = controller.store;
        var classId = controller.get("class.id");
        var productId = controller.get("class.product.id");
        SakuraiWebapp.Question.getClassMisconceptions(store, classId, productId)
            .then(function(questions){
                controller.set("classMisconceptions", questions);
            });
    },
    
    /**
     * Function to increment the remediation link view
     * @see QuestionPartialMixin
     */
    incRemediationLinkView: function(remediationLink){
        /*
            the class using this mixin should have a property 'canIncRemediationLinkView'
            indicating if it can inc the remediation link view
         */
        if (!this.get("canIncRemediationLinkView")) return;

        var store = this.store;
        var authenticationManager = SakuraiWebapp.context.get("authenticationManager");
        var userId = authenticationManager.getCurrentUserId();
        SakuraiWebapp.RemediationLinkView.incRemediationLinkViews(store, remediationLink.get("id"), userId);
    },

    actions: {
        showInQuestionLibrary: function(){
            var classId = this.get("class.id");
            var url = "/instructor/library/results/" + classId +
                        "?direction=DESC&classMisconception=" + classId;
            this.transitionToRoute(url);
        },

        /**
         * Action trigger in the HMCD misconception.hbs
         * @param remediationLink
         */
        onRemediationLinkClick: function(remediationLink){
            this.incRemediationLinkView(remediationLink);
            window.open(remediationLink.get("fullUrl"));
        },
    }
});