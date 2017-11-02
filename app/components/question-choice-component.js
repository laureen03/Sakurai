SakuraiWebapp.QuestionChoiceComponent = Ember.Component.extend(
SakuraiWebapp.QuestionMixin, {
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

    isMultiple: Ember.computed('model', function () {
        if ((this.get("model.interactions")) && (this.get("model.interactions").get('firstObject').maxChoices == 1) && (this.get("model.interactions").get('firstObject').maxChoices == 1)) {
            $('.question-container input[name=singleq-radio]').prop('checked', false);
            return false;
        } else {
            $('.question-container input[type=checkbox]').prop('checked', false);
            return true;
        }
    }),

    isQuestionChanged: function () {
        this.set("isDisable", false);
    }.observes('questionIndex'),

    /* A C T I O N S*/
    actions: {
        submitQuestion: function () {
            var component = this;
            var answer = [];
            if (component.get("isMultiple")) {
                $('.question-container input:checked').each(function () {
                    answer.push($(this).data('id'));
                });
                if (answer.length != 0) {
                    component.sendAction('data-save-action', answer);
                    component.set("isDisable", true);
                } else {
                    component.sendAction('data-shuffle-action');
                }
            } else {
                var selectedItem = $('.question-container input[name=singleq-radio]:checked');
                if (selectedItem.length != 0) {
                    answer.push(selectedItem.data('id'));
                    component.sendAction('data-save-action', answer);
                    component.set("isDisable", true);
                } else {
                    component.sendAction('data-shuffle-action');
                }
            }
        },

        displayAnswerKey: function() {
            var component = this;
            component.sendAction('data-display-answer-key-action');
        }
    }
});
