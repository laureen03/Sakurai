import Ember from "ember";

export default Ember.Component.extend({

	didInsertElement : function(){
	    this._super();
	    Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
  	},

  	afterRenderEvent : function(){
        var self = this;
        setTimeout(function(){
            self.animateCircle("div1", 1);
        },500);
    },

    animateCircle: function(section, index){
        var self = this;

        $("."+section+" .circle").removeClass("incomplete").addClass("inprogress");
        $("."+section+" .circle").html('<span class="glyphicon glyphicon-refresh animate-spin"></span>');
        setTimeout(function(){
            $("."+section+" .circle").removeClass("inprogress").addClass("ready");
            $("."+section+" .circle").html('<span class="glyphicon glyphicon-ok"></span>');
            if (index !== 3) {
                index += 1;
                self.animateCircle("div"+ index, index);
            }
        },500);
    }
});
