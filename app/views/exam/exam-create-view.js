import Ember from "ember";
import UserInterfaceFeaturesMixin from "mixins/user-interface-features";

export default Ember.Component.extend(
    UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forStudentComplete',
    _controller: null,
    
    didReceiveAttrs: function () {
        var controller = this.get('controller');
        this.set("_controller", controller);
    },

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions : function() {
        this.activeHeaderMenu("menu-exam");
        this.fixMainMenu();
        this.initClicks();
    },

    initClicks: function(){
        var controller = this.get('_controller');
        var numQuestions = controller.get('numQuestions');
        var minutesLimit = controller.get('minutesLimit');

        //Init Time Limit
        $(".exam-content").on("click", "#noTimeLimitRadio", function () {
            $("#time-limit-text").addClass('disabled');
            $("#minutes_limit").addClass('disabled');
        });

        $(".exam-content").on("click", "#timeLimitRadio", function () {
            $("#time-limit-text").removeClass('disabled');
            $("#minutes_limit").removeClass('disabled');
        });

        $(".exam-content").on("click", "#progressAlertRadio", function () {
            $(".questions-desc select").addClass('disabled');
            $(".progress-alert-on-msg").removeClass('hide');
            $("input[name=timeLimit]").prop('disabled', true);
            $("#minutes_limit").addClass('disabled');
            $("#timeLimitRadio").prop("checked", true);
            controller.set('numQuestionsSelected', numQuestions[numQuestions.length - 1]);
            controller.set('minLimitSelected', minutesLimit[minutesLimit.length - 1]);
        });

        $(".exam-content").on("click", "#progressAlertRadioOff", function () {
            $(".questions-desc select").removeClass('disabled');
            $(".progress-alert-on-msg").addClass('hide');
            $("input[name=timeLimit]").prop('disabled', false);
            $("#noTimeLimitRadio").prop("checked", true);
            controller.set('numQuestionsSelected', numQuestions[0]);
            controller.set('minLimitSelected', minutesLimit[0]);
        });
    }

});
