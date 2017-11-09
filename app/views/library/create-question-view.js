import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {

    layoutName: 'layout/forInstructorComplete',
    didReceiveAttrs : function(){

        $(".question-form").bind("keypress", function(e) {
          var KEYCODE = ( document.all ? window.event.keyCode : e.which) ;
          if (KEYCODE === 13) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
    },

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions : function() {
        this.activeHeaderMenu("menu-questionLibrary");
        this.fixMainMenu();

    },

});
