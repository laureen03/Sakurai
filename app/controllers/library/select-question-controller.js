import Controller from '@ember/controller';
import Ember from 'ember';
import ControllerMixin from 'mixins/controller';
import FeatureMixin from 'mixins/feature';
import Question from 'models/question';

export default Controller.extend(
    ControllerMixin,
    FeatureMixin,{
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
            return Question.questionTypes();
        }),

        actions: {
            createQuestion: function(questionType){
                var clazz =  this.get('class');
                this.transitionToRoute("/instructor/library/createQuestion/" + clazz.get('id') + "/0?type="+questionType);
            }
        }

    });
