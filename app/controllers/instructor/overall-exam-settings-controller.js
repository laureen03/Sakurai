SakuraiWebapp.InstructorOverallExamSettingsController = Ember.Controller.extend(
    Ember.Evented,
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,{
        headerClasses: Ember.inject.controller(),
        instructor: Ember.inject.controller(),
        instructorController: Ember.computed.alias("instructor"),

        /**
         * @property {SakuraiWebapp.Class} the class
         */
        class: null,

        /**
        * @property {String} customize option
        **/
        customize: "customize_setting",

        /**
        * @property {SakuraiWebapp.ClassExamOverallSettings} Class Exam Overall Settings
        */
        classExamOverallSettings: null,

        /**
         * Get the minimum threshold Proficiency for the current classExamOverallSettings
         **/
        minimumThreshold: Ember.computed('classExamOverallSettings', function(){
            var classExamOverallSettings = this.get("classExamOverallSettings");
            if (classExamOverallSettings && classExamOverallSettings.get("customThreshold")) {
                return classExamOverallSettings.get("customThreshold");
            }
            return this.class.get("product").get("passingThreshold");
        }),

        /**
         * List of Nclex proficiency threshold level the user can choose for exam
         * @property []
         **/
        nclexProficiencyLevels: null,

        hideThresholdLabels: null,

        customThreshold: null,

        isHideThresholdOn: Ember.computed('hideThresholdLabels', function(){
            if (this.get('hideThresholdLabels')) {
                return true;
            }
            return false;
        }),

        /**
         * Initializes an empty classExamOverallSettings
         */
        initClassExamOverallSettings: function(){
            var controller = this;
            var classExamOverallSettings = controller.store.createRecord("classExamOverallSetting");
            //Set default 'hideThresholdLabels' to false
            classExamOverallSettings.set('hideThresholdLabels', false);
            classExamOverallSettings.set('customThreshold', controller.get("minimumThreshold"));
            classExamOverallSettings.set('class', controller.get("class"));

            controller.set("classExamOverallSettings", classExamOverallSettings);

        },

        actions:{
            customizeOverallExamSettings: function() {
                var controller = this;
                var classExamOverallSettings = controller.get("classExamOverallSettings");

                if (!controller.get("hideThresholdLabels")) {
                    classExamOverallSettings.set('customThreshold', controller.get("customThreshold"));
                } else {
                    classExamOverallSettings.set('customThreshold', null);
                }

                classExamOverallSettings.set('hideThresholdLabels', controller.get("hideThresholdLabels"));

                classExamOverallSettings.save().then(function(){
                    controller.transitionToRoute("/instructor/customizeExam/" + controller.get("class").get("id"));
                })
            },

            goBack: function(productId, classId){
                var controller = this;
                controller.get("classExamOverallSettings").rollbackAttributes();
                controller.transitionToRoute("/instructor/customizeExam/" + classId);
            }
        }
    });
