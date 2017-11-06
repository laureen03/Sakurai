/**
 * Base Student Controller for all sub route in the student module
 * @type {*}
 */
import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';

export default Controller.extend(
    ControllerMixin, {

    /**
     * It contains the current student active classes
     */
    classes : Ember.A(),

    /**
     * Adds a new class to the header
     * @param newClass
     */
    addClass: function(newClass){
        var classes = this.get("classes");
        classes.addObject(newClass);
    },

    /**
     * Remove class of specific product
     * @param productId
     */
    removeInternalClass: function(productId){
        var classes = this.get("classes");
        for (var i=0; i < classes.get("length"); i++){
            var currentClass = classes.nextObject(i);
            if (currentClass && currentClass.get("internal")) {
                if (currentClass.get("product").get("id") === productId){
                    classes.removeAt(i, 1);
                }
                
               // activeClasses.pushObject(classes.nextObject(i));
            }
        }
        //TODO foreach
    }


});