/**
 *
 * @type {SakuraiWebapp.AdminHomeView}
 */
SakuraiWebapp.AdminProductsView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {
    layoutName: 'layout/forAdmin',
    didInsertElement : function(){
        this.fixMainMenu();
    }
});
