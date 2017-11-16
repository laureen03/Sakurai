
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';

export default Ember.Controller.extend(
    ControllerMixin,
    FeatureMixin,
    {
    instructor: Ember.inject.controller(),

    activeClasses : Ember.computed.alias("instructor.activeClasses"),
    inactiveClasses : Ember.computed.alias("instructor.inactiveClasses"),

    hasClasses:Ember.computed('activeClasses.[]','inactiveClasses.[]', function(){
        return (this.get("hasActiveClasses") || this.get("hasInactiveClasses"));
    }),

    hasActiveClasses: Ember.computed('activeClasses.[]', function(){
        return this.get("activeClasses").get('length') > 0;
    }),

    hasInactiveClasses: Ember.computed('inactiveClasses.[]', function(){
        return this.get("inactiveClasses").get('length') > 0;
    }),

    /**
     * {bool} Indicates if the edit class functionality is enabled
     */
    showCodeAndEditEnabled: Ember.computed('isCCMAllowed', function(){
        return !this.get("isCCMAllowed");
    }),

    /**
     * {bool} Indicates if the join co instructor functionality is enabled
     */
    joinCoInstructorEnabled: Ember.computed('isCCMAllowed', function(){
        return !this.get("isCCMAllowed");
    }),

    /**
     * {bool} Indicates if the ccm new class is enabled functionality is enabled
     */
    ccmNewClassEnabled: Ember.computed('isCCMAllowed', function(){
        return this.get("isCCMAllowed");
    }),

    actions:{
        goToEdit: function(id){
            this.transitionToRoute("/instructor/addEditClass/"+id);
        }
    }
});