import Ember from "ember"; 

export default Ember.Component.extend({
    tagName: 'div',
    attributeBindings: ['style'],
    classNames: ['progress-bar'],
    classNameBindings: ['isCorrect:correct:wrong'],

    style: Ember.computed('percentage', function(){
        var width = this.validateRange(this.get('percentage'));
        return Ember.String.htmlSafe("width: " + width + '%');
    }),


    validateRange: function(value) {

        if (typeof value === 'number') {

            if (value >= 0 && value <= 100) {
                return value;
            } else {
                Ember.Logger.error('ProgressBarComponent: value is out of range. Expecting 0 <= value <= 100');
                return 0;
            }
        } else {
            Ember.Logger.error('ProgressBarComponent: value is not a number. Expecting a number.');
            return 0;
        }
    }
});
