import Controller from '@ember/controller';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';

export default Controller.extend(
    ControllerMixin, 
    FeatureMixin,{

    products: null
    
});