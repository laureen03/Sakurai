import Ember from "ember"; 

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ["color-bar"],
    attributeBindings: ['style'],
    classNameBindings: ['typeof'],

    typeof: Ember.computed('addClass', function(){
        var value = this.get('addClass');
        return value;
    }),

    style: Ember.computed('total', 'value', function(){
        if (this.get('value') !== -1) {
            var total = this.get('total');
            var value = this.get('value');
            var width = (value / total) * 100;
            return Ember.String.htmlSafe('width:'+width+'%');
        }else{
            return Ember.String.htmlSafe('width:0%');
        }
        
    }),

});
