SakuraiWebapp.InstructorManageAssignmentRoute = Ember.Route.extend(SakuraiWebapp.ResetScroll,{

    model: function(params) {
        var store = this.get('store');
        var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
        authenticationManager.setImpersonatedUser(false);
        var editMode = parseInt(params.assignmentId) !== 0;
        var copyMode = params.action == 'copy';

        return Ember.RSVP.hash({
                assignment : (editMode) ? store.find('assignment', params.assignmentId) : null,
                class : store.find('class', params.classId),
                isEditMode: editMode,
                isCopyMode: copyMode
        });
    },

    afterModel: function(model, transition) {
        var edit = model.isEditMode;
        return Ember.RSVP.hash({
            "assignment": edit ? model.assignment.reload() : model.assignment,
            "product": model.class.get("product")
        }).then(function (hash) {
                model.assignment = hash.assignment;
                model.product = hash.product;
        });
    },

    setupController: function(controller, model) {

        var product =  model.product;
        var selectOptions = SakuraiWebapp.TermTaxonomy.findTermTaxonomyTypes(product);
        var selectedTermTaxonomy = product.get('defaultDataType');

        controller.set('class', model.class);
        controller.set('product', product);
        controller.set("selectedTermTaxonomy", selectedTermTaxonomy);

        controller.set("termTaxonomyTypeOptions", selectOptions);
        controller.set('isEditMode', model.isEditMode);
        controller.set('isCopyMode', model.isCopyMode);

        controller.get("instructorAssignStep3").initController();
        if (model.isEditMode) {
            var assignment = model.assignment;
            controller.identifyTermTaxonomyTypeIfNecessary(assignment);
            if(model.isCopyMode) {
                controller.initCopyAssignment(assignment);
                controller.set('product', model.class.get('product'));
            } else {
                controller.setAssignment(assignment);
                assignment.get("classes").then(function(classes){
                     var product = classes.nextObject(0).get("product");
                     controller.set('product', product);
                 });
            }
        } else {
            controller.initAssignment();
            controller.set('product', model.class.get('product'));
            if(controller.get("isQuestionCollectionPreSelected") ||
               controller.get("isChapterPreSelected")){
                controller.nextStep();
            }
        }
    },

    deactivate: function(){
        var controller =  this.get("controller");
        controller.resetValues();
    }


});
