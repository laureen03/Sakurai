
import Ember from "ember";
import AuthKey from 'sakurai-webapp/models/auth-Key';
import Class from 'sakurai-webapp/models/class';

export default Ember.Route.extend({

    //does sso
	model: function(params) {

        return Ember.RSVP.hash({
            authKey: AuthKey.sso(this.store, params.token, params.product, params.templateId),
            params: params,
            store: this.store
        });
	},

    //loads some more data for handling the sso request
    afterModel: function(model){
        var route = this;

        var authKey = model.authKey;
        var context = context;
        var manager = context.get('authenticationManager');
        var isbn = model.params.product;

        return new Ember.RSVP.Promise(function (resolve, reject) {
            manager._authenticate(authKey, { sso: true, isbn: isbn}).then(function(){
                var authenticated = manager.isAuthenticated();
                if (authenticated){
                    route.afterModelSSO(manager, authKey, model).then(function(hash){
                        var chapterFound = (hash.chapters && hash.chapters.get("length") > 0);
                        var studentFound = (hash.students && hash.students.get("length") > 0);
                        model.classes = hash.classes;
                        model.product = hash.product;
                        model.chapter = (chapterFound) ? hash.chapters.nextObject(0) : null;
                        model.student = (studentFound) ? hash.students.nextObject(0) : null;
                        resolve();
                    }, reject);
                }
                else{
                    resolve();
                }
            }, reject);
        });
    },

    /**
     * Handles the after model for a sso request
     * @param {AuthenticationManager} manager
     * @param {AuthKey} authKey
     * @returns {*}
     */
    afterModelSSO: function(manager, authKey, model){
        var store = this.store;
        var user = manager.getCurrentUser();
        var product = authKey.get("product");
        var chapterId = model.params.chapterId;
        var studentId = model.params.studentId;

        //resolve class
        var classId = model.params.classId;
        var classPromise = (classId) ?
            store.find("class", { "externalId" : classId}) :
            Class.getActiveClassesByProductAndUser(store, product.get("id"), user.get("id"));

        return Ember.RSVP.hash({
            product: product,
            classes: classPromise,
            chapters: (chapterId) ? store.query("section", { "externalId" : chapterId}) : null,
            students: (studentId) ? store.query("user", {"externalId": studentId}) : null
        });
    },

    setupController: function(controller, model) {
        var context = context;
        var manager = context.get('authenticationManager');

        if (manager.isAuthenticated()){

            if (model.params.templateId) {//Product Tag
                manager.setProductTag(model.params.templateId);
            }

            if (controller.get("deepLinkingEnable")){
                manager.set("deepLinking", true);
                controller.deepLinkingTo(model);
            }
            else{
                var metadata = controller.store._metadataFor("authKey");
                var classes = metadata.classes;

                if (controller.get("isStudentView")){
                    manager.set("studentView", true);
                    controller.afterAuthenticateStudentView(classes);
                }
                else{
                    controller.afterAuthenticate(metadata.totalClasses, classes);
                }
            }
        }
        else{
            //TODO ??
        }
    },

    deactivate: function () {
    	var controller = this.get('controller');
    	controller.set("token", "");
    }
});
