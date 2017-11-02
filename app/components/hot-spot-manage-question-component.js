/**
 *
 * @type {SakuraiWebapp.HotSportManageQuestionComponent}
 */
SakuraiWebapp.HotSpotManageQuestionComponent = Ember.Component.extend(
    SakuraiWebapp.ManageQuestionComponentMixin,
    {

    /**
     * @property {Boolean} Show error for answer choice
     */
    answerChoiceInvalid: false,

    /**
    * Real dimensions
    **/
    realWidth: 0,
    realHeight: 0,

    /**
    * Proportional dimensions
    **/
    proportionalWidth: 0,
    proportionalHeight: 0,

    imageLoaded: false,

    imageUrl: "",

    createMode: false,

    correctResponse: null,

    observeQuestionImage: Ember.observer('questionImage', function(){
        var self = this;
        
        if (self.get("questionImage")!= null){
            //set url Image
            if (self.get("questionImage.content"))
                self.set("imageUrl", self.get("questionImage.content"));
            else
                self.set("imageUrl", self.get("questionImage.relativePath"));

            self.set("data-question.questionMedia", self.get("imageUrl"));

            //Get Real size
            var img = $(".select-point-result img"); // Get my img elem
            //Get real size
            $("<img/>") // Make in memory copy of image to avoid css issues
                .attr("src",  self.get("imageUrl"))
                .load(function() {
                    if (!self.get("isDestroyed")) {
                         //Get Proportional size
                        self.set("proportionalWidth", $(".select-point-result img").width());   
                        self.set("proportionalHeight", $(".select-point-result img").height()); 
                        
                        //Get Real size
                        self.set("realWidth", this.width);   // Note: $(this).width() will not
                        self.set("realHeight", this.height);  // work for in memory images
                       
                        self.set("imageLoaded", true);
                    }
                });
        }
        else {
            //Clean Image
            self.set("imageUrl", "");
        }
    }),

    drawCorrectResponse: Ember.observer('imageLoaded', 'createMode', function(){
        var self = this;
        if(!self.get("createMode") && self.get("imageLoaded")) {
            self.setCorrectAnswer(self.get("correctResponse"));
        }
    }),


    /**
     * will destroy for interaction
     */
    willDestroyElementInteraction: function(){
        
    },

    /**
     * Setups the interaction during the didInsertElement
     * @see SakuraiWebapp.ManageQuestionComponentMixin#didInsertElement
     * @see SakuraiWebapp.ManageQuestionComponentMixin#didInsertElementInteraction
     */
    didInsertElementInteraction: function () { 
        var self = this;
        //Initialize the drag Functionality
        self.$(".result-ok-ql").draggable({ 
          containment: ".select-point-result"
        });
        //Initialize the resize Functionality
        self.$(".result-ok-ql").resizable();
    },

    /**
    * Set position Of correct Answer and check if need to set the Wrong Answer
    **/
    setCorrectAnswer: function(correctResponse){
        var self = this, values, width, height, x, y;
        values = correctResponse.value;
        //Get Dimensions and convert to proportional Dimensions
        width = values[2] - values[0];
        height = values[3] - values[1];
        
        //Calculate the middle to get the point
        x = values[0] + (width / 2);
        y = values[1] + (height / 2);

        //Get Dimensions and convert to proportional Dimensions
        width = self.convertToRealPositionOrSize(self.get("proportionalWidth"), self.get("realWidth"), width);
        height = self.convertToRealPositionOrSize(self.get("proportionalHeight"), self.get("realHeight"), height);

        //Set Size to Correct Response Box 
        $(".result-ok-ql").css("width", width);
        $(".result-ok-ql").css("height", height);
        
        //Set position
        self.movePosition(x, y, ".result-ok-ql", width, height);
    },

    /**
    * Generic function to move the object to specific x,y
    **/
    movePosition: function(x, y, objectSelector, width, height){
        var self = this, proportional_x = 0, proportional_y = 0;
        proportional_x = self.convertToRealPositionOrSize(self.get("proportionalWidth"), self.get("realWidth"), x);
        proportional_y = self.convertToRealPositionOrSize(self.get("proportionalHeight"), self.get("realHeight"), y);

        //Set position
        $(objectSelector).css("top", self.validatePoint(proportional_y, self.get("proportionalHeight"), (height / 2)));
        $(objectSelector).css("left", self.validatePoint(proportional_x, self.get("proportionalWidth"), (width / 2)));
    },

    /**
    * Validate Point
    **/
    validatePoint: function(point, maxValue, half_size_box){
        point = point - half_size_box; 
        
        //If the point is < than 0
        if (point < 0)
            point = 0;
        else if ((point + (half_size_box * 2)) > maxValue){ //If the point is > than total size
            point = maxValue - (half_size_box * 2); 
        }
        return point;
    },

    /**
     * Initializes the question interaction
     * @param {SakuraiWebapp.Question} question
     * @param {bool} createMode
     *
     * It is called by
     * @see SakuraiWebapp.ManageQuestionComponentMixin#initQuestion
     *
     * @see SakuraiWebapp.ManageQuestionComponentMixin#initInteraction
     */
    initInteraction: function (question, createMode) {
        this.set("createMode", createMode);
        if (!createMode) {
            this.set("correctResponse", question.get("interactions").get("firstObject").correctResponse);
        }
    },

    /**
     * Validates the interaction section
     * @return {bool}
     *
     * It is called by
     * @see SakuraiWebapp.ManageQuestionComponentMixin#saveQuestion
     *
     * @see SakuraiWebapp.ManageQuestionComponentMixin#validateInteraction
     */
    validateInteraction: function(){
        return !this.get("answerChoiceInvalid");
    },

    /**
     * Set all values for Interaction and return a Json
     *
     * @see SakuraiWebapp.ManageQuestionComponentMixin#saveQuestion
     * @see SakuraiWebapp.ManageQuestionComponentMixin#getInteractions
     **/
    getInteractions: function () {
        var interaction = SakuraiWebapp.Interaction.create({}),
            answerChoiceInvalid = true,
            correctAnswerChoices = [],
            self = this;

        return new Em.RSVP.Promise( function(resolve, reject) {

            interaction.setProperties({
                "type": SakuraiWebapp.Question.HOT_SPOT,
                "subType": SakuraiWebapp.Question.HOT_SPOT,
                "shuffle": false,
                "minChoices":0,
                "maxChoices":0,
                "expectedLength":0
            });

            if (self.get("questionImage")){
                var width, height, x, y;
                var borderSize = ($('.result-ok-ql').css('border-top-width').replace("px", "")) * 2;
                answerChoiceInvalid = false;
                width = $(".select-point-result .result-ok-ql").width() + borderSize;
                height = $(".select-point-result .result-ok-ql").height() + borderSize;
                x = $(".select-point-result .result-ok-ql").position().left;
                y = $(".select-point-result .result-ok-ql").position().top;
                
                x = self.convertToRealPositionOrSize(x, self.get("proportionalWidth"), self.get('realWidth'));
                y = self.convertToRealPositionOrSize(y, self.get("proportionalHeight"), self.get('realHeight'))
                
                correctAnswerChoices.pushObject(x);  //Set x
                correctAnswerChoices.pushObject(y);  //Set Y
                correctAnswerChoices.pushObject(x + self.convertToRealPositionOrSize(width, self.get("proportionalWidth"), self.get('realWidth'))); //Set width
                correctAnswerChoices.pushObject(y + self.convertToRealPositionOrSize(height, self.get("proportionalHeight"), self.get('realHeight'))); //Set height
                
                interaction.setCorrectResponse(null, correctAnswerChoices, false);
            }

            self.set("answerChoiceInvalid", answerChoiceInvalid);

            // Resolve the promise with a json object for the interactions
            resolve( [interaction.getJson()] );
        });
    },


    /**
    * Convert to real x and Y
    **/
    convertToRealPositionOrSize: function(x, y, z){
        return (x * z) / y;
    }
});
