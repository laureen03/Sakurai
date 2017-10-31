import Ember from 'ember';

export default Ember.Mixin.create({
	
  activate: function() {
    this._super();
   	$("html, body").animate({ scrollTop: 0 }, "slow"); 
   }
});