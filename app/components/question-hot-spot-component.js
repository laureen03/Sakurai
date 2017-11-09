import Ember from "ember"; 
import QuestionMixin from "mixins/question-mixin";


export default Ember.Component.extend(
    QuestionMixin,{
    /**
     * @property {string} shuffle action
     */
    'data-shuffle-action': null,

    /**
     * @property {string} save action
     */
    'data-save-action': null,

    /**
     * @property {string} display answer key action
     */
    'data-display-answer-key-action': null,

    //isFullQuestion: false,
    x_pos: -1,
    y_pos: -1,
    realWidth: 0,
    realHeight: 0,
    proportionalWidth: 0,
    proportionalHeight: 0,
    answerVisible: false,

    hotspotQuestionText: function () {
        //Get image size real and proportional
        this.getSizeofImage();

        return this.get("model.questionText");
    }.property("model.questionText"),

    isQuestionChanged: function () {
        this.set("isDisable", false);
        this.resetValues();
    }.observes('questionIndex'),

    resetValues: function () {
        this.set("x_pos", -1);
        this.set("y_pos", -1);
        this.set("answerVisible", false);
        $(".clickable-area").hide();
    },

    /**
     * Get Real Size of Image and the Proportional Image, because the system have mobile suport
     * and maybe the image change the size
     **/
    getSizeofImage: function () {
        var component = this;
        var img = $("img")[0]; // Get my img elem
        //Get real size
        $("<img/>") // Make in memory copy of image to avoid css issues
                .attr("src", $(img).attr("src"))
                .load(function () {
                    component.set("realWidth", this.width);   // Note: $(this).width() will not
                    component.set("realHeight", this.height);  // work for in memory images.
                });

        //Get Proportional size
        component.set("proportionalWidth", $("img").css("width").replace("px", ""));
        component.set("proportionalHeight", $("img").css("height").replace("px", ""));
    },

    /**
     * Set x and y when the user click
     **/
    setPositions: function (x_pos, y_pos) {
        var component = this;

        if (!component.get("answerVisible")) {
            //Display the circle
            component.set("answerVisible", true);
            //Get image size real and proportional
            component.getSizeofImage();
            $(".clickable-area").show();
        }

        //Set circle position
        $(".clickable-area").css("top", y_pos - 12.5);
        $(".clickable-area").css("left", x_pos - 15);

        //Get Real x and y and safe position
        component.set("x_pos", x_pos);
        component.set("y_pos", y_pos);
    },

    convertToRealSize: function (proportionalSize, realSize, proportionalPosition) {
        return parseFloat((realSize * proportionalPosition) / proportionalSize);
    },

    afterRenderEvent: function () {
        var component = this;

        //Event click on image
        $(".bg-hotspot").click(function (e) {
            var parentOffset = $(this).offset();
            var relX = e.pageX - parentOffset.left;
            var relY = e.pageY - parentOffset.top;
            component.setPositions(relX, relY);
        });
    },

    /* A C T I O N S*/
    actions: {
        submitQuestion: function () {
            var component = this;
            if ((component.get("x_pos") !== -1) && (component.get("y_pos") !== -1)) {
                //Get Real x and y and safe position
                component.set("x_pos", component.convertToRealSize(component.get("proportionalWidth"), component.get("realWidth"), component.get("x_pos")));
                component.set("y_pos", component.convertToRealSize(component.get("proportionalHeight"), component.get("realHeight"), component.get("y_pos")));

                var answer = [component.get("x_pos"), component.get("y_pos")];
                component.sendAction('data-save-action', answer);
                component.set("isDisable", true);
            }
        },

        displayAnswerKey: function() {
            var component = this;
            component.sendAction('data-display-answer-key-action');
        }
    },

    didInsertElement: function () {
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
    },
});
	