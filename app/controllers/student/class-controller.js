import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import Enrollment from 'models/enrollment';

export default Controller.extend(
    ControllerMixin,
    FeatureMixin, {
    headerClasses: Ember.inject.controller(),
    student: Ember.inject.controller(),

    /**
     * @property {Class[]} student active classes
     */
    classes : Ember.computed.alias("student.classes"),

    /**
     * @property {Product} first product the user have access
     */
    products : Ember.A(),

    /**
     * @property {StudentController} student controller
     */
    //studentController: Ember.computed.alias('student'),

    hasClasses: Ember.computed('classes.[]', function(){
        var controller =  this;
        return controller.get("classes").get("length") !== 0;
    }),
    
    //Control Success Vars
    studentId: null,

    publisherId: null,

    /**
     * Indicates if the ccm join class feature is enabled
     * @property {bool}
     */
    ccmJoinClassEnabled: Ember.computed('isCCMAllowed', function(){
        return this.get("isCCMAllowed");
    }),

    /**
     * Sets default values
     * @param {number} studentId
     * @param {number} publisherId
     */
    setDefaultValues:function(studentId, publisherId){
        var controller = this;
        controller.set("studentId", studentId);
        controller.set("publisherId", publisherId);
        controller.get("products").removeObjects(controller.get("products"));
        var hasClasses = controller.get("classes").get("length") > 0;
        if (!hasClasses) //The user no have classes, get a products
        {
            var promise =  controller.store.query('product', {userId: studentId, publisherId: publisherId});
            promise.then(function (products) {
                if (controller.get("sso")){
                    var context = context;
                    var authenticationManager = context.get('authenticationManager');
                    var productId = authenticationManager.getCurrentProduct().get("id");
                    products = products.filterBy("id", productId);
                }
                controller.get("products").pushObject(products.get("firstObject"));
            });
        }
    },

    actions:{
        enrollSelfStudy: function(product){
            var controller = this;
            var store = controller.store;
            var user = this.get("user");
            product.get("internalClass").then(function (clazz) {
                var record = Enrollment.createEnrollmentRecordSelfStudy(store, {
                    "clazz": clazz,
                    "user": user.get("id")
                });
                record.then(function(enrollment){
                    var promise = enrollment.save();
                    promise.then(function(result){
                        result.get('class').then(function(_class){
                            controller.get("student").addClass(_class._internalModel);
                        });
                        controller.transitionToRoute("student.haid", clazz.get('id'));
                    });
                });
            });
            
        }
    }
    
});