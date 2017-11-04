/**
 *
 * @type {*}
 */
SakuraiWebapp.HaidPerformanceBarsComponent = Ember.Component.extend({

    /**
     * @property {SakuraiWebapp.TermTaxonomyStat}
     */
    'data-stats':null,

    /**
     * @property {string} type
     */
    'data-type': null,

    /**
     * @property {bool} indicates if the data should be filter by type
     */
    'data-filter-type': false,

    /**
     * @property {string} title label
     */
    'data-label-title': null,

    /**
     * @property {string} i18n key for title label
     */
    'data-label-title-i18n': null,

    /**
     * @property {bool} indicates if it is self study
     */
    'data-self-studying': null,

    /*
    * @property {string} name of the function into the parent
    */
    'data-what-is-this-event': "openModalWhatisThis",

    /**
     * Return strengths per type
     * @property {SakuraiWebapp.TermTaxonomyPerformance[]}
     */
    performances: Ember.computed("data-stats.performances.[]", "data-type", function(){
        return (this.get("data-filter-type")) ?
            this.get("data-stats").performancesByType(this.get("data-type")) :
            this.get("data-stats").get("performances");
    }),

    /**
     * @property {string} title label
     */
    labelTitle: Ember.computed("data-label-title", "data-label-title-i18n", function(){
        var i18n = this.get("data-label-title-i18n");
        var label = this.get("data-label-title");
        if (i18n){
            label = I18n.t(i18n);
        }

        return label;
    }),

    actions: {
        openModalWhatisThis: function(modalId){
            var component = this;
            component.sendAction('data-what-is-this-event', modalId, component.get("labelTitle"));
        }
    }

});