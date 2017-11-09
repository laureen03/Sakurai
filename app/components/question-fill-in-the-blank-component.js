import Ember from "ember"; 
import QuestionMixin from "mixins/question-mixin";
import Question from "models/question";


export default Ember.Component.extend(
    QuestionMixin,{
    /**
     * @property {string} shuffle action
     */
    'data-shuffle-action': null,

    /**
     * @property {string} save action
     */
    'data-save-action': null,

    /**
     * @property {string} display answer key action
     */
    'data-display-answer-key-action': null,

    answer: null,

    isQuestionChanged: function () {
        var component = this;
        //Reset and disable inputs
        component.set('answer', null);
        component.set("isDisable", false);
        if (component.get("model.interactions") && component.get('model.interactions').get('firstObject') && $.inArray(Question.TOOLS.CALCULATOR, component.get('model.interactions').get('firstObject').tools) >= 0) {
            // Make sure the calculator is set to 0
            $('.question-answer .calculator').calculator('option', 'value', 0);

            // Show the calculator if it's listed in the tools array
            $('.question-answer .is-calculator').removeClass('hidden');
        } else {
            // Remove the calculator, if there is one
            $('.question-answer .is-calculator').addClass('hidden');
        }

    }.observes('questionIndex').on('init'),

    afterRenderEvent: function () {

        var regex = /[^!@#\$%\^\&*\_\>\)\(+=]+$/,
                component = this;

        $('#answer').keyup(function (e) {
            var key = (/Firefox/i.test(navigator.userAgent)) ? 173 : 189;
            var scope = $(this);
            var text = scope.val();


            //Filter input text to accept only numbers , arrow movement, backspace, delete, point, or negative sign
            if ((e.which === 8) || (e.which === 46) || (e.which === 190) ||
                    (e.which >= 35 && e.which <= 40) || (e.which >= 48 && e.which <= 57) || (e.which === key) ||
                    (e.which >= 96 && e.which <= 105)) {

                //event bugfix - if user press shift + special char too fast the event will not catch it
                if (regex.test(scope.val()) === false) {
                    scope.val(function (index, value) {
                        return value.substr(0, value.length - 1);
                    });

                }
                scope.val(text.replace(/[^0-9\.\-]/g, ''));

                //check for negative sign (-) on first position
                if (text.lastIndexOf('-') > 0) {
                    //Remove if have one
                    scope.val(function (index, value) {
                        return value.substr(0, value.length - 1);
                    });
                }


                //Check for one decimal point
                if ((text.split(".").length - 1) > 1) {
                    var val;
                    var tmp = text.split(".");
                    for (var i = 0; i < tmp.length; i++) {
                        if (tmp[i].match(/[0-9\.]+/)) {
                            tmp[i] += ".";
                            break;
                        }
                    }
                    val = tmp.join("");

                    scope.val(val);

                }

                //check for valid number of chars after decimal point (.)
                if (text.indexOf('.') >= 1) {
                    var textSplitted = text.split(".");
                    if (textSplitted[1].length > 9) {
                        scope.val(function (index, value) {
                            return value.substr(0, value.length - 1);
                        });
                    }
                }


            } else {
                scope.val(text.replace(/[^0-9\.\-]/g, ''));
            }
        });


        $("#answer-form").validate({
            onsubmit: false,
            rules: {
                answer: 'required'
            },
            messages: {
                answer: {
                    required: I18n.t('textEntry.validation.required')
                }
            },
            errorPlacement: function (error, element) {
                error.appendTo(element.parent());
            }
        });

        $('.question-answer .calculator').calculator({
            onClose: function (value) {
                // Make sure the input field is updated before validating the form
                // i.e. the binding will be updated when the ember run loop is run
                Ember.run(function () {
                    component.set('answer', value);
                });
                $("#answer-form").valid();
            }
        });
        if (component.get("model.interactions") && component.get('model.interactions').get('firstObject') && $.inArray(Question.TOOLS.CALCULATOR, component.get('model.interactions').get('firstObject').tools) >= 0) {
            // Show the calculator if it's listed in the tools array
            $('.question-answer .calculator').removeClass('hidden');
        }
    },

    /* A C T I O N S*/
    actions: {
        submitQuestion: function () {

            var component = this;
            var answer = [];

            if ($("#answer-form").valid()) {
                component.set("isDisable", true);
                answer.push(component.get('answer'));
                component.sendAction('data-save-action', answer);
            }
        },

        displayAnswerKey: function() {
            var component = this;
            component.sendAction('data-display-answer-key-action');
        }
    },

    didInsertElement: function () {
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
    },

    willDestroyElement: function () {
        // Destroy calculator instance when the component is destroyed
        $('.question-answer .calculator').calculator('destroy');
    }
});
