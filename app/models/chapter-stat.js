import DS from 'ember-data';
import Ember from "ember";

export default DS.Model.extend({
    
    weaknesses: DS.hasMany('chapterPerformance', { async: true }),
    strengths: DS.hasMany('chapterPerformance', { async: true }),
    chapterPerformances: DS.hasMany('chapterPerformance', { async: true }),

    /**
     * Standard method to get the performances, so it is compliant with TermTaxonomyStat
     * This is used in some components
     * @property {SakuraiWebapp.ChapterPerformance[]}
     */
    performances: Ember.computed('chapterPerformances.[]', function(){
        return this.get("chapterPerformances");
    })

});