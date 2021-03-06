
import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';
import DateUtil from 'sakurai-webapp/utils/date-util';

export default Ember.Route.extend(
    ResetScroll,{

    model: function(params) {
        var store = this.store;

        var authenticationManager = context.get('authenticationManager');
        authenticationManager.setImpersonatedUser(false);

        var editMode = params.assignmentId !== null;
        var copyMode = params.action === 'copy';

        return Ember.RSVP.hash({
                assignment : (editMode) ? store.find('assignment', parseInt(params.assignmentId)) : null,
                class : store.find('class', params.classId),
                classExamOverallSettings: store.query('classExamOverallSetting', {classId: params.classId}),
                isEditMode: editMode, 
                isCopyMode: copyMode
        });
    },


    afterModel: function(model) {
        var edit = model.isEditMode;
        return Ember.RSVP.hash({
            "assignment": edit ? model.assignment.reload() : model.assignment,
            "product": model.class.get("product")
        }).then(function (hash) {
                model.assignment = hash.assignment;
                model.product = hash.product;
        });
    },

    /**
     * Setup controller
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
        controller.set('isEditMode', model.isEditMode);
        controller.set('isCopyMode', model.isCopyMode);
        controller.set("class", model.class);
        var product =  model.class.get('product');
        controller.set("numQuestions", product.get('examLengths'));
        controller.set("minutesLimit", product.get('examTimeLimits'));
        controller.set("product", product);
        controller.set('timezones', DateUtil.getTimeZones());
        controller.set("nclexProficiencyLevels", product.get('nclexProficiencyLevels'));
        var classExamOverallSettings = model.class.get('classExamOverallSettings');
        controller.set('classExamOverallSettings', classExamOverallSettings);
        controller.set("classHideThresholdLabels", model.class.get('hideThresholdLabels'));
        controller.set("classCustomThreshold", model.class.get('customThreshold'));

        if (model.isEditMode) {
            if(model.isCopyMode) {
                controller.initCopyAssignment(model.assignment);
            } else {
                controller.setAssignment(model.assignment);
            }
            
        } else {
            controller.initAssignment();
        }
    },

    /**
     * Deactivate controller
     */
    deactivate: function() {
        var controller = this.get("controller");
        controller.resetValues();
    }


});
