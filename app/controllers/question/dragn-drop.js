
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import QuestionMixin from 'sakurai-webapp/utils/question';

export default Ember.Controller.extend(
    ControllerMixin,
    QuestionMixin,{

    isQuestionChanged: Ember.observer('questionIndex', function(){
        this.set("isDisable", false);
    }),

    /* A C T I O N S*/
    actions: {
      submitQuestion: function(){
        //No have validation because the aswerd could be the same order
        var controller = this;
        var answer = [];
        $('.question-container-dragn-drop li').each(function() {
		      answer.push($(this).data('id'));
		    });
        controller.get("quizzer").saveResult(answer);
        controller.set("isDisable", true);
      }
    }

});
