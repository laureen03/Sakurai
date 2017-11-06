import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import Enrollment from 'models/enrollment';

export default Controller.extend(
    ControllerMixin, {
    headerClasses: Ember.inject.controller(),
    student: Ember.inject.controller(),

    /**
     * @property {Class[]} student active classes
     */
    classes : Ember.computed.alias("student.classes"),

    placeholder: I18n.t('classes.enterCode'),

    //Control Success Vars
    isSuccessCode: false,
    classCreated: null,
    studentId: null,
    isFailedCode: false,
    failedMessage: "",
    classCode: "",


    setDefaultValues:function(studentId){
        this.set("studentId", studentId);
    },

    resetValues:function(){
        this.set("isSuccessCode", false);
        this.set("isFailedCode", false);
        this.set("classCreated", null);
        this.set("failedMessage", "");
        this.set("classCode", "");
    },

    actions:{

    	/**
		Set new class and go to How I am doing page
    	**/
    	continueHMID: function(){
            var classCreated = this.get("classCreated");
    		this.transitionToRoute("student.haid", classCreated.get("id"));
    	},

    	saveCode:function(){

            var classCode = this.get('classCode'), 
                studentId = this.get('studentId'),
                controller = this,
                store = this.store;


            if(classCode !== '' && classCode !== 'null'){

                var record = Enrollment.createEnrollmentRecord(store, {
                    "code":classCode,
                    "user":studentId
                });

                record.then(function(result){
                    var promise = result.save();
                    promise.then(function (result) {
                        var userObj = result.get('user'),
                            classObj = result.get('class');

                        if(userObj){
                            controller.set("isSuccessCode", true);
                            controller.set("classCreated", classObj);
                            result.get('class').then(function(_class){
                                controller.get("student").addClass(_class._internalModel);
                            });
                           
                            result.get('class').then(function (clazz) {
                                clazz.get("product").then(function (product) {
                                    controller.get("student").removeInternalClass(product.get("id"));
                                });
                            });   
                        }
                        else{
                            controller.set("isFailedCode", true);
                        }
                        controller.set('classCode','');
                    },function(reason){
                        if (reason.status === 400){
                            controller.set("failedMessage", I18n.t('classes.enrollmentAlreadyExists'));
                            Ember.Logger.warn('Code already exists');
                        }else {
                            controller.set("failedMessage", I18n.t('classes.failJoined'));
                            Ember.Logger.warn('Invalid class code');
                        }
                        controller.set("isFailedCode", true);
                    });
                });
            }else{
                controller.set("failedMessage", I18n.t('classes.failJoined'));
                controller.set("isFailedCode", true);
            }
    	}
    }
    
});