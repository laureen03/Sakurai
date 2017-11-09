import Ember from "ember"; 
import QuestionMixin from "mixins/question-mixin";


export default Ember.Component.extend(
    QuestionMixin,{
    actions: {
        submitQuestion: function () {
            this.sendAction('submitQuestion');
        },

        displayAnswerKey: function() {
            this.sendAction('displayAnswerKey');
        }
    }
});
