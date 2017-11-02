SakuraiWebapp.LibraryResultsView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {

	layoutName: 'layout/forInstructorComplete',
    _controller: null,

    didReceiveAttrs : function(){
        this._controller = this.get('controller');
    },

    didInsertElement: function() {
	    // this._controller = this.get('controller');
        Ember.run.scheduleOnce('afterRender', this, 'didRenderActions');
    },

    didRenderActions: function () {
        var previewMode = this._controller.get('preview');
        this.activeHeaderMenu("menu-questionLibrary");
        this.fixMainMenu();

        $('.input-in-dropdown').click(function(e) {
            e.stopPropagation();
        });

        if (previewMode) {
            this.showPreviewModal();
        }

        // Subscribe to events from the controller
        this._controller.on('preview.show', this, this.showPreviewModal);
        this._controller.on('preview.hide', this, this.hidePreviewModal);

        //scroll to question if necessary
        this.scrollToQuestionIfNecessary();

        if (this._controller.get("isInFrame")) {
            this._controller.get('library').resizeLeftNavigation();
        }

        this.scrollToQuestionId();
  	},

    willDestroyElement: function() {
        // Unsubscribe from events
        this._controller.off('preview.show', this, this.showPreviewModal);
        this._controller.off('preview.hide', this, this.hidePreviewModal);
    },

    showPreviewModal: function() {
        Ember.Logger.debug(this.toString() + ': show the preview modal');
        $('#preview-modal').modal('show');
    },

    hidePreviewModal: function () {
        Ember.Logger.debug(this.toString() + ': hide the preview modal');
        $('#preview-modal').modal('hide');
    },

    scrollToQuestionIfNecessary: function(){
      var scrollTo = this._controller.get("scrollTo");
        if ($("#question_" + scrollTo).length){
            $("#question_" + scrollTo)[0].scrollIntoView();
        }
    },

    scrollToQuestionId: function(){
        var scrollTo = this._controller.get("scrollTo");
        var questionP = $('li:contains('+scrollTo+')');
        if (questionP.length && questionP[0].closest(".question-partial")){
            questionP[0].closest(".question-partial").scrollIntoView();
        }
    }
});
