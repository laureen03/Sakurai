import Ember from "ember";

export default Ember.Component.extend({

	layoutName: "instructor/assign/slider",
    attributeBindings: ['data-value'],

    'data-value': 0,

	didInsertElement : function(){
        var self = this;

		/**
         * Set the initial value of the slider
         * @type {Number}
         */
		var sliderElement = $("#ml-slider");
        if (sliderElement){
            var sliderInitVal = this.get('data-value');
            var $slider2 = sliderElement.slider({
                range: "min",
                min: 1,
                max: 8,
                value: sliderInitVal,
                slide: function( event, ui ) {
                    self.updateMasteryLevel(ui.value);
                },
                change: function( event, ui ) {
                    self.updateMasteryLevel(ui.value);
                }
            });

            // and then we can apply pips to it!
            $slider2.slider("pips", {
                first: "pip",
                last: "pip"
            });
            //Fix the first and last pip according to the wireframes
            $('.ui-slider-pip-last').css({'left':'99%'});
            $('.ui-slider-pip-first').css({'left':'1%'});
        }
	},

    updateMasteryLevel: function (value) {
        // we have to call on blur here to trigger ember bindings
        $( "#amount" ).val( value ).blur();
    },

    updateSlider: Ember.observer('data-value', function() {
        var sliderValue = this.get('data-value');

        this.$('#ml-slider').slider('value', sliderValue);
    })

});
