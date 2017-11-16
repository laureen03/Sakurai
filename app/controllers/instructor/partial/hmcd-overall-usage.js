
import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';

export default Ember.Controller.extend(
    ControllerMixin, {
    /**
     * @property {mixed} contains the metadata of Overall Usage
     */
    overallUsageMetadata: Ember.Object.create({}),

    /**
     * @property {ClassUsage} stats of class consumption of practice quizzes and questions
     */
    classUsage: null,

    /**
    *  Init values for Overall Usage
    **/
    initOverallUsage:function(overallUsageMetadata, classUsage){
    	var controller = this;
    	controller.set("classUsage", classUsage);
    	controller.updateOverallMetadata(overallUsageMetadata);
    },

    /**
     * Updates the overall metadata
     * @param metadata
     */
    updateOverallMetadata: function(metadata){
        var overallUsageMetadata = Ember.Object.create({});

        overallUsageMetadata.set("averageQuestions", metadata.averageQuestions);
        overallUsageMetadata.set("averageQuizzes", metadata.averageQuizzes);
        overallUsageMetadata.set("questionsAnswered", metadata.questionsAnswered);
        overallUsageMetadata.set("quizzesTaken", metadata.quizzesTaken);
        overallUsageMetadata.set("totalStudents", metadata.totalStudents);

        this.set("overallUsageMetadata", overallUsageMetadata);
    }
});