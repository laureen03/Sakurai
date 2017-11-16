
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import QuestionMixin from 'sakurai-webapp/utils/question';
import Question from 'sakurai-webapp/models/question';

export default Ember.Controller.extend(
    ControllerMixin,
    QuestionMixin,{
    quizQuizzer: Ember.inject.controller(),
  	answer: null,

    isQuestionChanged: Ember.observer('questionIndex', function(){
        var controller = this;
        //Reset and disable inputs
        controller.set('answer', null);
        controller.set("isDisable", false);

        if ($.inArray(Question.TOOLS.CALCULATOR, controller.get('model.interactions').objectAt(0).tools) >= 0) {
            // Make sure the calculator is set to 0
            $('.question-answer .calculator').calculator('option', 'value', 0);

            // Show the calculator if it's listed in the tools array
            $('.question-answer .is-calculator').removeClass('hidden');
        } else {
            // Remove the calculator, if there is one
            $('.question-answer .is-calculator').addClass('hidden');
        }

    }),

    /* A C T I O N S*/
    actions: {
      submitQuestion: function(){

        var controller = this;
        var answer = [];

        if ( $("#answer-form").valid() ) {
            controller.set("isDisable", true);
            answer.push(controller.get('answer'));
            controller.get("quizzer").saveResult(answer);
        }
      }
    }

});
