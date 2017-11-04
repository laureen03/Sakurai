SakuraiWebapp.InstructorProfileView = Ember.Component.extend(
    SakuraiWebapp.ProfileMixin,
    SakuraiWebapp.UserInterfaceFeaturesMixin, {

    layoutName: 'layout/forInstructor',

    didInsertElement: function() {
        this.initFormValidation();

        this.fixMainMenu();

        // Subscribe to events
        this.get('controller').on('profile.save.failed', this, this.viewUpdateFail);
        this.get('controller').on('profile.save.success', this, this.viewUpdateSuccess);
    },

    willDestroyElement: function() {
        this.resetManualErrors();

        // Unsubscribe from events
        this.get('controller').off('profile.save.failed', this, this.viewUpdateFail);
        this.get('controller').off('profile.save.success', this, this.viewUpdateSuccess);
    }
});
