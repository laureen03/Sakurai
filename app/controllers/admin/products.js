
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';

export default Ember.Controller.extend(
    ControllerMixin, 
    FeatureMixin,{
    	
    admin: Ember.inject.controller(),

    /**
     * @property {Ember.A} alias of current instructor products from injected admin controller
     */
    products : Ember.computed.alias("admin.products")

});