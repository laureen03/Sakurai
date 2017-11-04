SakuraiWebapp.LibrarySelectQuestionController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,{
        //Reference another contoller
        library: Ember.inject.controller(),
        headerClasses: Ember.inject.controller(),
        headerAdmin: Ember.inject.controller(),

        /**
         * @property {Class} selected class
         */
        class: Ember.computed.alias("library.class"),

        /**
         * Return all the question type mapped in question model
         * @property questionType
         * @return []
         */
        questionTypes: Ember.computed(function(){
            return SakuraiWebapp.Question.questionTypes();
        }),

        actions: {
            createQuestion: function(questionType){
                var clazz =  this.get('class')
                this.transitionToRoute("/instructor/library/createQuestion/" + clazz.get('id') + "/0?type="+questionType);
            }
        }

    });
