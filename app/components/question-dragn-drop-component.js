SakuraiWebapp.QuestionDragnDropComponent = Ember.Component.extend(
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

    isQuestionChanged: function () {
        this.set("isDisable", false);
    }.observes('questionIndex'),

    addSortableBehavior: function () {
        Ember.run.schedule('afterRender', this, function () {
            var $sortable = $(".question-container-dragn-drop");

            if ($sortable.length && !$sortable.hasClass('ui-sortable')) {
                // Sortable element has not been initialized
                $sortable.sortable();
                $sortable.disableSelection();
            }
        });
    }.observes('questionIndex').on('init'),

    /* A C T I O N S*/
    actions: {
        submitQuestion: function () {
            //No have validation because the aswerd could be the same order
            var component = this;
            var answer = [];
            $('.question-container-dragn-drop li').each(function () {
                answer.push($(this).data('id'));
            });
            component.sendAction('data-save-action', answer);
            component.set("isDisable", true);
        },

        displayAnswerKey: function() {
            var component = this;
            component.sendAction('data-display-answer-key-action');
        }
    }
});
