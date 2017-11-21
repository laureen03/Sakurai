import Ember from 'ember';
/**
 * This mixing contains common methods and properties for question types controllers
 */
export default Ember.Mixin.create({
  	
    //Disable btn and options
    isDisable: false,
    
    btnStyle: Ember.computed("isDisable", function(){ 
        return (this.get("isDisable")) ? "btn-blue btn disabled" : "btn-blue btn";
    }),

    actions: {
        /**
         * Action trigger in the question-partial.hbs
         * @param reference
         */
        onReferenceLinkClick: function(reference){
            window.open(reference.url);
        }
    }
});
