import Ember from "ember";

export default Ember.Component.extend({

    layoutName: 'layout/forInstructorComplete',
    didReceiveAttrs : function(){
        this.get('controller.headerClasses').activeHeaderMenu("menu-questionLibrary");
    }
});
