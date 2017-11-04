SakuraiWebapp.InstructorAddEditClassRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{
    model: function(params) {
        var store = this.store;
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        var user = authenticationManager.getCurrentUser();
        var editMode = params.classId != 0;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var promise = (editMode) ?
                                store.find("class", params.classId) :
                                store.query("product", {userId: user.get("id")});
            promise.then(function (data) {
                    resolve({
                        currentClass: (editMode) ? data: undefined,
                        products: (!editMode) ? data : undefined,
                        editMode: editMode
                    });
                },
                function () {
                    reject(arguments);
                }
            );
        });
    },

    setupController: function(controller, model) {
        if (!model.editMode){
            var products = model.products;
            controller.set("schools", Ember.A());
            controller.set("products", products);
            if (products.get("length") > 0){ //Select First Product
                var product = products.nextObject(0);
                controller.set("productId", product.get("id"));
            }
            controller.initClass();
        }
        else {
            var clazz =  model.currentClass;
            clazz.get("school").then(function(school){
                controller.set("schools", Ember.A([school]));
                clazz.get("product").then(function(product){ //load product as well
                    controller.setClass(clazz);
                });
            });
        }

    },

    /**
     * Deactivate controller
     */
    deactivate: function() {
        var controller = this.get("controller");
        controller.get("currentClass").rollbackAttributes();
    }

});
