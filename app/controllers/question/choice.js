
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import QuestionMixin from 'sakurai-webapp/utils/question';

export default Ember.Controller.extend(
  ControllerMixin,
  QuestionMixin,{

    isMultiple: Ember.computed('model', function(){
      if ((this.get("model.interactions")) && (this.get("model.interactions").get('firstObject').maxChoices === 1) && (this.get("model.interactions").get('firstObject').maxChoices === 1)){
        $('.question-container input[name=singleq-radio]').prop('checked', false);
        return false;
      }
      else{
        $('.question-container input[type=checkbox]').prop('checked', false);
        return true;
      } 
    }),


    isQuestionChanged: Ember.observer('questionIndex', function(){
        this.set("isDisable", false);
    }),

    /* A C T I O N S*/
    actions: {
      submitQuestion: function(){
        var controller = this;
        var answer = [];
        if (controller.get("isMultiple")){
          $('.question-container input:checked').each(function() {
  		      answer.push($(this).data('id'));
  		    });
  		    if (answer.length !== 0){
            controller.get("quizzer").saveResult(answer);
            controller.set("isDisable", true);
          }
          else{
            controller.get("quizzer").shuffle();
          }
        }else{
          var selectedItem = $('.question-container input[name=singleq-radio]:checked');
        
          if (selectedItem.length !== 0){
              answer.push(selectedItem.data('id'));
              controller.get("quizzer").saveResult(answer);
              controller.set("isDisable", true);
              //$('.question-container input[name=singleq-radio]').prop('checked', false);
          }
          else {
            controller.get("quizzer").shuffle();
          }
        }
      }
    }
});
