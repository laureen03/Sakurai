import Ember from "ember"; 

export default Ember.Component.extend({

    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['modal-full-question', 'modal', 'fade'],
    classNameBindings: ['component-class'],

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    questionImage: null,

    questionText: ''

});
