SakuraiWebapp.QuestionFooterComponent = Ember.Component.extend(
SakuraiWebapp.QuestionMixin, {
    actions: {
        submitQuestion: function () {
            this.sendAction('submitQuestion');
        },

        displayAnswerKey: function() {
            this.sendAction('displayAnswerKey');
        }
    }
});
