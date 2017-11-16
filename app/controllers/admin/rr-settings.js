
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import FeatureMixin from 'sakurai-webapp/mixins/feature';
import Product from 'sakurai-webapp/models/product';

export default Ember.Controller.extend(
    ControllerMixin, 
    FeatureMixin,{

	admin: Ember.inject.controller(),
	headerClasses: Ember.inject.controller(),

    /**
     * @property {array} List of available mastery levels
     */
	mlList:[5,6,7,8],

	/**
     * @property {Int} Current ML
     */
	targetMasteryLevel: null,

	/**
     * @property {class} Current Class 
     */
	class: null,

	/**
     * @property {product} Current Product 
     */
	product: null,

	/**
     * @property {bool} Is active
     */
	isActive: false,

	/**
     * @property {Json} Value of settings
     */
	rrSettings: null,

	initValues: function(product){
		var controller = this;
		if (!controller.get("rrSettings")){ //Don't update RR properties values
			var active = (product.get("isRRAllowed")?true:false);
			controller.set('targetMasteryLevel', product.get("reviewAndRefreshML"));
			controller.set('isActive', active);
		}
	},

	actions:{

		saveSettings: function() {
            var controller = this;
            var object = new Object({});
            object.reviewRefreshEnabled = this.get("isActive");
            object.reviewRefreshML = this.get("targetMasteryLevel");

            var valueJson = JSON.stringify(object);
            Product.updateReviewRefreshSettings(controller.get("product"), "reviewRefresh", valueJson).then(function(value){
            	if (value){
            		controller.set("rrSettings", valueJson);
            		toastr.success(I18n.t('rrSettings.successMessage'));
                    if (controller.get("isInFrame")){
                        $('.toast-top-full-width').css("top", (controller.get("mouseY") - 50) + "px");
                    }
            	}else{
            		toastr.error(I18n.t('rrSettings.errorMessage'));
	                if (controller.get("isInFrame")){
	                    $('.toast-top-full-width').css("top", (controller.get("mouseY") - 50) + "px");
	                }
            	}
            });
        }
	}
});
