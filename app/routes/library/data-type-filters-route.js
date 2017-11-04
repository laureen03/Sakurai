SakuraiWebapp.LibraryDataTypeFiltersRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    deactivate: function() {
        var controller = this.get('controller');
        controller.resetValues();
    }
});
