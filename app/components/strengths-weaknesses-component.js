/**
 *
 * @type {*}
 */
SakuraiWebapp.StrengthsWeaknessesComponent = Ember.Component.extend({
	action_pre_select: "preSelect",
	action_select_weaknesses: "selectWeakest",

    /**
     * @property {SakuraiWebapp.TermTaxonomyStat|SakuraiWebapp.ChapterStat}
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
     * @property {string} btn label
     */
    'data-label-btn': null,

    /**
     * @property {string} i18n key for btn label
     */
    'data-label-btn-i18n': null,

    /**
     * Return strengths per type
     * @property {SakuraiWebapp.TermTaxonomyPerformance[]}
     */
    strengths: Ember.computed("data-stats.strengths.[]", "data-type", function(){
        return (this.get("data-filter-type")) ?
            this.get("data-stats").strengthsByType(this.get("data-type")) :
            this.get("data-stats").get("strengths");
    }),

    /**
     * Return weaknesses per type
     * @property {SakuraiWebapp.TermTaxonomyPerformance[]}
     */
    weaknesses: Ember.computed("data-stats.weaknesses.[]", "data-type", function(){
        return (this.get("data-filter-type")) ?
            this.get("data-stats").weaknessesByType(this.get("data-type")) :
            this.get("data-stats").get("weaknesses");
    }),

    /**
     * @property {string} btn label
     */
    labelBtn: Ember.computed("data-label-btn", "data-label-btn-i18n", function(){
        var i18n = this.get("data-label-btn-i18n");
        var label = this.get("data-label-btn");
        if (i18n){
            label = I18n.t(i18n);
        }

        return label;
    }),

    /**
     * @property {string} title label
     */
    labelBtn: Ember.computed("data-label-btn", "data-label-btn-i18n", function(){
        var i18n = this.get("data-label-title-i18n");
        var label = this.get("data-label-title");
        if (i18n){
            label = I18n.t(i18n);
        }

        return label;
    }),


	actions: {
		pre_select:function(id, type){
	    	this.sendAction('action_pre_select', id, type);
        },

        selectWeakest: function(type){
            this.sendAction('action_select_weaknesses', type);
        }
	}
});