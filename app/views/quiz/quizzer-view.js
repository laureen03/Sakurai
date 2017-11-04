SakuraiWebapp.QuizQuizzerView = Ember.Component.extend({

    timeRemaining: 0,
    timeOnCurrentQuestion: 0,

	didInsertElement : function(){
	    this._super();
        var controller = this.get('controller');
        var self = this;
        var selectedQuiz = controller.get("selectedQuiz");
        $(document).on('visibilitychange', function () {
            if ((selectedQuiz) && (selectedQuiz.get("hasAssignment") && selectedQuiz.get("assignment").get("hasTimeLimit")) ||
                controller.get("isExam")) { //Only add this event listener when the quiz has timeLimit or is an exam
                if (document.visibilityState == 'hidden') {
                    $('.sakurai-timer').css("visibility", "hidden");
                    controller.set("timerUpdating", true);
                    if (controller.get("isExam")) { //Save Current time in exam
                        self.set("timeRemaining", controller.get("selectedQuiz.timeLeft"));
                        self.set("timeOnCurrentQuestion", controller.get("selectedQuiz.timeOnCurrentQuestion"));
                    }
                } else {
                    if (selectedQuiz){
                        if (controller.get("isExam")) {
                            SakuraiWebapp.Exam.getTimeRemaining(selectedQuiz.get("id")).then(function (response) {
                                self.activeTimer(response);
                            });
                        } else {
                            SakuraiWebapp.Quiz.getTimeRemaining(selectedQuiz.get("id")).then(function (response) {
                                self.activeTimer(response);
                            });
                        }
                    }
                }
            }
        });
    },

    activeTimer: function(response){
        var self = this;
        var controller = (this.get('controller')) ? this.get('controller') : this.get('_controller');
        controller.set("timerUpdating", false); //Restore Timer
        $('.sakurai-timer').css("visibility", "visible");
        if (response.length > 0){
            if (controller.get("isExam")){ //Calculate again time on question
                var timeOnCurrentQuestion = (response[1]) ? response[1] : self.get("timeOnCurrentQuestion");
                controller.get("selectedQuiz").set("timeOnCurrentQuestion", timeOnCurrentQuestion);
                if (!controller.get("selectedQuiz.hasTimeLimit") && response[2] > 0) {
                    controller.get("selectedQuiz").set("timeOnExam", response[2]);
                }
            }
            controller.get("selectedQuiz").set("timeLeft", response[0]);
        }else {
            controller.timeOut();
        }

    }
});
