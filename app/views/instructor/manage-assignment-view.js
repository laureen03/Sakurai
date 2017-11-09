import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
	layoutName: 'layout/forInstructorComplete',
    _controller: null,
    'copyAssignment': 'copyAssignment',

    didReceiveAttrs : function(){
        this._controller = this.get('controller');
    },

	didInsertElement : function(){
	    var editMode =  this._controller.isEditMode;
        //set "Assing Quiz "
      this.activeHeaderMenu("menu-assignQuiz");

      this.fixMainMenu();

        /*Disable the Enter in the form*/
        $('form').bind("keypress", function(e) {
          var KEYCODE = ( document.all ? window.event.keyCode : e.which) ;
          if (KEYCODE === 13) {
            e.preventDefault();
            e.stopPropagation();
          }
        });

        if (editMode) {
            // It will start by default on step 1. Need to move to step 3.
            this.sendAction('copyAssignment');
        }
  	}

});
