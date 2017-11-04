SakuraiWebapp.QuestionHotSpotController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.QuestionMixin,{
    
    //isFullQuestion: false,
    x_pos: -1,
    y_pos: -1,
    realWidth: 0,
    realHeight: 0,
    proportionalWidth: 0,
    proportionalHeight: 0,
    answerVisible: false,

    hotspotQuestionText: Ember.computed("model.questionText", function(){    
    	//Get image size real and proportional
    	that.get('controller').getSizeofImage();

    	return this.get("model.questionText");
    }),

    isQuestionChanged: Ember.observer('questionIndex', function(){
        this.set("isDisable", false);
        this.resetValues();
    }),

    resetValues:function(){
    	this.set("x_pos", -1);
    	this.set("y_pos", -1);
    	this.set("answerVisible", false);
    	$(".clickable-area").hide();
    },

	/**
    * Get Real Size of Image and the Proportional Image, because the system have mobile suport 
    * and maybe the image change the size
    **/
    getSizeofImage:function(){
        var controller = this;
    	var img = $("img")[0]; // Get my img elem
		//Get real size
		$("<img/>") // Make in memory copy of image to avoid css issues
		    .attr("src", $(img).attr("src"))
		    .load(function() {
		        controller.set("realWidth", this.width);   // Note: $(this).width() will not
		        controller.set("realHeight", this.height);  // work for in memory images.
            });

		//Get Proportional size
		controller.set("proportionalWidth", $("img").css("width").replace("px",""));   
		controller.set("proportionalHeight", $("img").css("height").replace("px",""));  
    },

    /**
    * Set x and y when the user click
    **/
    setPositions: function(x_pos,y_pos){
        var controller = this;

    	if (!controller.get("answerVisible")){
    		//Display the circle
	    	controller.set("answerVisible", true);
	    	//Get image size real and proportional
	    	controller.getSizeofImage();
	    	$(".clickable-area").show();
    	}

    	//Set circle position
    	$(".clickable-area").css("top", y_pos-12.5);
    	$(".clickable-area").css("left", x_pos-15);

    	//Get Real x and y and safe position
	   	controller.set("x_pos", x_pos);
	   	controller.set("y_pos", y_pos);
    },

    convertToRealSize: function(proportionalSize, realSize, proportionalPosition){
    	return parseFloat((realSize * proportionalPosition) / proportionalSize);
    },

    /* A C T I O N S*/
    actions: {
      submitQuestion: function(){
        var controller = this;
        if ((controller.get("x_pos") !== -1) && (controller.get("y_pos") !== -1)){
        	//Get Real x and y and safe position
            controller.set("x_pos", controller.convertToRealSize(controller.get("proportionalWidth"), controller.get("realWidth"), controller.get("x_pos")));
            controller.set("y_pos", controller.convertToRealSize(controller.get("proportionalHeight"), controller.get("realHeight"), controller.get("y_pos")));

            var answer = [controller.get("x_pos"), controller.get("y_pos")];
	        controller.get("quizzer").saveResult(answer);
            controller.set("isDisable", true);
        }
      }
    }
});
	