/**
 * Component for displaying the remediation link table
 *
 * @extends Ember.Component
 */

SakuraiWebapp.RemediationLinkViewsTableComponent = Ember.Component.extend(
    SakuraiWebapp.SortableMixin,
    {
        
    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['remediation-link-views-table'],

    /*
     * @property {Ember.A} remediation links
     */
    'data-remediationLinkViews': null,

    /**
     * @property {DS.Store}
     */
    'data-store': null,
    /**
     * @property {SakuraiWebapp.SortableHelper}
     */
    sortable: null,

    /**
     * @property {boolean}
     */
    isFullQuestion: false,

    /**
     * @property {question}
     */
    model: null,

    //Question Component
    componentName: "",

    /**
     * @property {SakuraiWebapp.SortableHelper}
     */
    remediationLinkViewsSortable: Ember.computed("data-remediationLinkViews.[]", function(){
        var sortable = this.get("sortable") ||
            SakuraiWebapp.SortableHelper.create({ sort: "lastViewAt", direction:false });

        var remediationLinkViews = this.get("data-remediationLinkViews") || Ember.A();

        var remediationLinkPromises = remediationLinkViews.map( function(item) {
            return item.get('remediationLink');
        });
        Ember.RSVP.all(remediationLinkPromises).then( function() {
            sortable.set("data", remediationLinkViews);
        });

        this.set("sortable", sortable);

        return sortable;
    }),

    actions: {
        closeModal: function(){
            if (this.get("isFullQuestion")){
                this.set("isFullQuestion", false);
                this.set("model", null);
            }
            else
                $('#remediation-link-views-mdl').modal('hide');
        }, 

        onSortByCriteria: function(sortableId, criteria){
            var component = this;
            component.sortByCriteria(sortableId, criteria);
        },
        
        showRemediationQuestion: function(questionId){
            var controller = this,
                store = this.get('data-store');
            store.find('question', questionId).then(function(questionLoaded){
                var componentName = '';
                var questionType = questionLoaded.get("interactions").get('firstObject').type;
                if (questionType === SakuraiWebapp.Question.CHOICE)
                    componentName = 'question-choice';
                if (questionType === SakuraiWebapp.Question.HOT_SPOT)
                    componentName = 'question-hot-spot';
                if (questionType === SakuraiWebapp.Question.FILL_IN_THE_BLANK)
                    componentName = 'question-fill-in-the-blank';
                if (questionType === SakuraiWebapp.Question.DRAG_AND_DROP)
                    componentName = 'question-dragn-drop';
                controller.set("componentName", componentName);
                controller.set("isFullQuestion", true);
                controller.set("model", questionLoaded);
            });
        },
 
        onRemediationLinkClick: function(remediationLink){
            window.open(remediationLink.get("fullUrl"));
        },

        onReferenceClick: function(referenceView){
            var context = SakuraiWebapp.context;
            var lwwProperties = context.get("environment").getProperty("lww");
            var thePointUrl = lwwProperties.baseUrl + lwwProperties.referenceUrlPath;
            var isbn = context.get("authenticationManager").get("isbn");
            var fullUrl = thePointUrl + isbn + referenceView.get("url");
            window.open(fullUrl);
        }

    }

});
