SakuraiWebapp.InstructorPartialHmcdStrengthsWeaknessesController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin, {

    instructorHmcd: Ember.inject.controller(),

    /**
     *
     */
    class: Ember.computed.alias('instructorHmcd.class'),

    /**
     * @property {taxonomyStats} list of chapter stats
     */
    taxonomyStats: null,

    /**
     * @property {chapterStats} list of chapter stats
     */
    chapterStats: null,

    /**
     * @property {Object} taxonomy settings
     */
    taxonomySettings: null,

    /**
     * Init Strengths and Weaknesses
     **/
    initStrengthsWeaknesses:function(taxonomySettings, chapterStats, termTaxonomyStats){
    	var controller = this;
        controller.set("taxonomySettings", taxonomySettings);

        controller.loadChapterStrengthsWeaknessesIfNecessary(chapterStats);
        if (termTaxonomyStats && termTaxonomyStats.get("length")){
            controller.loadTaxonomyStrengthsWeaknessesIfNecessary(termTaxonomyStats.nextObject(0));
        }
    },

    /**
     * Loads strengths and weaknesses
     * @param chapterStats
     */
    loadChapterStrengthsWeaknessesIfNecessary: function(chapterStats){
        var controller = this;
        controller.set("chapterStats", chapterStats);
    },

    /**
     * Loads taxonomy strengths and weaknesses
     * @param taxonomyStats
     */
    loadTaxonomyStrengthsWeaknessesIfNecessary: function(taxonomyStats){
        var controller = this;
        // @todo filter here for nursing concepts. just create a new object with those termTaxonomoy
        // performances. taxonomyStats = all meta that is not nursing concepts. nursingConceptStats = filtered performances
        controller.set("taxonomyStats", taxonomyStats);
    },

    actions:{
        onPerformanceTaxonomyClick: function(termTaxonomyId){
            var classId = this.get("class").get("id");
            var url = "/instructor/library/results/" + classId + "?termTaxonomyIds=" + termTaxonomyId;
            this.transitionToRoute(url);
        },

        onPerformanceChapterClick: function(chapterId){
            var classId = this.get("class").get("id");
            var url = "/instructor/library/results/" + classId + "?cid=" + chapterId;
            this.transitionToRoute(url);
        }
    }


});
