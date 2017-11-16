
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import Enrollment from 'sakurai-webapp/models/enrollment';

export default Ember.Controller.extend(
    ControllerMixin, {
    headerClasses: Ember.inject.controller(),
    instructor: Ember.inject.controller(),

    codePlaceholder: I18n.t('coInstructor.codePlaceholder'),

    didSucceed: false,
    instructorId: null,
    errorMessage: '',
    classCreated: null,
    classCode: '',

    resetValues:function(){
        this.set('didSucceed', false);
        this.set('errorMessage', '');
        this.set("classCreated", null);
        this.set('classCode', '');
    },

    actions:{

        endFlow: function(){
            this.transitionToRoute('instructor.class');
        },

        registerCoInstructor: function(){

            var classCode = this.get('classCode'),
                instructorId = this.get('instructorId'),
                self = this;

            if (classCode) {

                Enrollment.createEnrollmentRecord(this.store, {
                    code : classCode,
                    user : instructorId
                }).then( function(result){

                    result.save().then(function (result) {
                        result.get('class').then(function(classObj){
                            self.get('instructor').addClass(classObj._internalModel);
                            self.set("classCreated", classObj._internalModel);
                            self.set("didSucceed", true);
                            self.set('classCode','');
                        });
                    }, function(reason){
                        if (reason.status === 400){
                            self.set("errorMessage", I18n.t('coInstructor.error.alreadyExists'));
                            Ember.Logger.warn('Code already exists');
                        } else {
                            Ember.Logger.warn('Invalid class code');
                            self.set("errorMessage", I18n.t('coInstructor.error.invalid'));
                        }
                    });
                }, function() {
                    Ember.Logger.error('Unable to create enrollment record');
                });

            } else {
                this.set("errorMessage", I18n.t('coInstructor.error.invalid'));
            }
        }
    }

});
