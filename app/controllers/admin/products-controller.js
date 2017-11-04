import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';

export default Controller.extend(
    ControllerMixin, 
    FeatureMixin,{
    	
    admin: Ember.inject.controller(),

    /**
     * @property {Ember.A} alias of current instructor products from injected admin controller
     */
    products : Ember.computed.alias("admin.products")

});