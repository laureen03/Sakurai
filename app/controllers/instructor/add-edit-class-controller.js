import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import DateUtil from 'utils/date-util';
import Class from 'models/class';
import context from 'utils/context-utils';

export default Controller.extend(
    Ember.Evented, 
    ControllerMixin, {

    instructor: Ember.inject.controller(),

    isClassCreate: false,
    editMode: false,
    changeActive: false,

    /**
     * This is a list of products available by user
     * @property {products[]} product
     */
    products: [],
    productId: "",
    /**
     * This is a list of schools by publisher
     * @property {schools[]} school
     */
    schools: Ember.A(),
    schoolId: "",

    startDate: null,
    endDate: null,
    datepickerStartDate: null,

    /**
    * Class Name of the class
    * @property
    **/
    className: "",

    /**
     * This is the current class
     * @property currentClass Class
     */
    currentClass: null,

    initClass: function(){
        var store = this.store;
        var newClass = store.createRecord("class",{active: true});
        this.set("currentClass", newClass);
        this.set("editMode", false);
        this.set("isClassCreate", false);
        this.set("schoolId",null);
    },

    setClass: function(clazz){
        var controller = this;
        var school = clazz.get("school");
        var product = clazz.get("product");
        controller.set("currentClass", clazz);
        controller.set("className", clazz.get("name"));
        controller.set("productId", product.get("id"));
        controller.set("editMode", true);
        controller.set("isClassCreate", false);
        controller.set("changeActive", false);

        var dateUtil = new DateUtil();
        controller.set("startDate", dateUtil.format(clazz.get("startDate"), dateUtil.shortDateFormat));
        controller.set("endDate", dateUtil.format(clazz.get("endDate"), dateUtil.shortDateFormat));

        controller.set("schoolId", school.get("id"));
    },

    searchSchools: function(searchTerm){
        var authenticationManager = context.get('authenticationManager');
        var publisher = authenticationManager.getCurrentPublisher();
        var store = this.store;
        return store.query("school", {publisherId: publisher.get("id"), search: searchTerm});
    },

    actions:{
        createClass: function (data) {
            var controller = this;
            var dateUtil = new DateUtil();
            var clazz = controller.get("currentClass");

            clazz.set("startDate", dateUtil.parse(controller.get("startDate"), dateUtil.shortDateFormat));
            clazz.set("endDate", dateUtil.parse(controller.get("endDate"), dateUtil.shortDateFormat));

            if ($("#add-edit-class").valid()) {
                var store = this.store;
                var authenticationManager = context.get('authenticationManager');
                var user = authenticationManager.getCurrentUser();
                clazz.set("name", controller.get("className"));
                var record = Class.createClassRecord(store, {
                    class: clazz,
                    productId: controller.get("productId"),
                    schoolId: controller.get("schoolId"),
                    owner: user
                });

                record.then(function(_class){
                    var promise = _class.save();
                    promise.then(function (result) {
                        if (controller.get('editMode')){
                            controller.transitionToRoute("instructor.class");
                            if(controller.get("changeActive")){
                                controller.get("instructor").updateClass(result);
                            }
                        }
                        else {
                            controller.set("isClassCreate", true);
                            controller.set("currentClass", result);
                            controller.get("instructor").addClass(result);
                        }
                        controller.trigger('asyncButton.restore', data.component);
                    });
                });
            }
            else{
                controller.trigger('asyncButton.restore', data.component);
            }
        },
        setStatus: function(status){
            this.get("currentClass").set("active", status);
            this.set("changeActive", !this.get("changeActive"));
        }
    }

});
