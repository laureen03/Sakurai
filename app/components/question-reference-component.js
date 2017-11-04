/**
 *
 * This component to render question references
 * @type {SakuraiWebapp.QuestionReferenceComponent}
 */
SakuraiWebapp.QuestionReferenceComponent = Ember.Component.extend({

    /**
     * @property {array} [ { id: number, text: string, hasRemediationLink: bool, url: string, product: <productId> }... ]
     */
    'data-references':null,

    /**
     * @property {SakuraiWebapp.Product} product
     */
    'data-product-id': null,

    /**
     * @property {string} title label
     */
    'data-title': null,

    /**
     * @property {string} i18n key for title label
     */
    'data-title-i18n': null,

    /**
     * @property {string} reference action
     */
    'data-reference-action': null,

    references: [],

    /*
        Set Reference value with the filter by product Id
    */
    setupReferenceList: function() {
        var productId = this.get("data-product-id"),
            references = this.get("data-references"),
            self = this,
            filtered;

        self.get('data-references').then( function(references) {
            filtered = $.grep(references, function(reference){
                return reference.product == productId;
            });
            self.set('references', filtered);
        });
    }.on('init'),

    /**
     * @property {string} title label
     */
    title: Ember.computed("data-title", "data-title-i18n", function(){  
        var i18n = this.get("data-title-i18n");
        var label = this.get("data-title");
        if (i18n){
            label = I18n.t(i18n);
        }

        return label;
    }),

    actions:{
        onRemediationLinkClick: function(reference){
            this.sendAction('data-reference-action', reference);
        }
    }

});
