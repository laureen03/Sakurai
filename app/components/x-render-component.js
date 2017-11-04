SakuraiWebapp.XRenderComponent = Ember.Component.extend({
    tagName: "",
    'see-full-question-action': "showFullQuestion",
    "on-section-display": "onSectionDisplay",
    'data-store': null,

    layoutName: Ember.computed('displayLayout', function(){
    	if (this.get('displayLayout') == undefined)
    		return;
      return "question/answer_key_" + this.get('displayLayout'); 
    }),

    /**
     * Function to increment the remediation link view
     * @see QuestionPartialMixin
     */
    incRemediationLinkView: function(remediationLink, assignmentId){
        /*
            the class using this mixin should have a property 'canIncRemediationLinkView'
            indicating if it can inc the remediation link view
         */
        if (!this.get("isRemediationLinkAllowed")) return;

        var store = this.get("data-store");
        var authenticationManager = SakuraiWebapp.context.get("authenticationManager");
        var userId = authenticationManager.getCurrentUserId();
        
        SakuraiWebapp.RemediationLinkView.incRemediationLinkViews(store, remediationLink.get("id"), userId, assignmentId);
    },

    /**
     * Function to increment the reference view
     * @see QuestionPartialMixin
     */
    incReferenceView: function(reference){
        /*
            the class using this mixin should have a property 'canIncRemediationLinkView'
            indicating if it can inc the remediation link view
         */
        if (!this.get("isReferenceLinksAllowed") || !this.get("incReferenceViewsAllowed")) return;



        var store = this.get("data-store");
        var authenticationManager = SakuraiWebapp.context.get("authenticationManager");
        var userId = authenticationManager.getCurrentUserId();
        
        SakuraiWebapp.ReferenceView.incReferenceViews(store, reference.id, userId);
    },



    actions: {
        showFullQuestion: function(answer, template) {
            this.sendAction('see-full-question-action', answer, template);
        },

        onSectionDisplay: function(selector_id, section){
            this.sendAction('on-section-display', selector_id, section);    
        }, 

        onRemediationLinkClick:function(remediationLink, assignmentId){
          this.incRemediationLinkView(remediationLink, assignmentId);
          window.open(remediationLink.get("fullUrl"));
        },

        onReferenceLinkClick: function(reference){
            this.incReferenceView(reference);
            window.open(reference.url);
        }
    }
});