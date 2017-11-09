import Ember from "ember"; 

export default Ember.Component.extend({
	
	/**
	* Paremeters 
	**/
	correctResponse: null,
	result: null,
	isAnswerKey: null,
	idQuestion: null,
	answerChoicesPercentages: null,

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

	/**
	* Return correct class to use for the Correct Response, because this component 
	* is used by Answer Key and Question Library Result
	**/
	resultOkClass: Ember.computed("isAnswerKey", function(){
		return (this.get("isAnswerKey"))? "result-ok": "result-ok-ql";
	}),

	/**
	* Set position Of correct Answer and check if need to set the Wrong Answer
	**/
	setCorrectAnswer: Ember.observer('imageLoaded', function(){
		var self = this, values, width, height, x, y;
		values = self.get("correctResponse").value;
		//Get Dimensions and convert to proportional Dimensions
		width = values[2] - values[0];
		height = values[3] - values[1];
		
		//Calculate the middle to get the point
		x = values[0] + (width / 2);
		y = values[1] + (height / 2);

		//Get Dimensions and convert to proportional Dimensions
		width = self.convertToProportionalPositionOrSize(self.get("proportionalWidth"), self.get("realWidth"), width);
		height = self.convertToProportionalPositionOrSize(self.get("proportionalHeight"), self.get("realHeight"), height);

		//Set Size to Correct Response Box 
 		$("#correct-result-"+ self.get("idQuestion")).css("width", width);
 		$("#correct-result-"+ self.get("idQuestion")).css("height", height);
 		
 		//Set position
 		self.movePosition(x, y, "#correct-result-"+ self.get("idQuestion"), width, height);
 		
 		//Check if is a Answer Key show the result
 		if (self.get("isAnswerKey")){
			self.setAnswer();
		}else {
			self.drawAnswersForQL();
		}
	}),

	/**
	* Set position of wrong Answer
	**/
	setAnswer: function(){
		var self = this, width, height;
		var values = self.get("result").get("answer");
 		$("#result-"+ self.get("idQuestion")).show();
 		
 		width = $("#result-"+ self.get("idQuestion")).width();
 		height = $("#result-"+ self.get("idQuestion")).height();

 		self.movePosition(values[0], values[1], "#result-"+ self.get("idQuestion"), width, height);
	},

	/**
	* Draw all result in QL image
	**/
	drawAnswersForQL: function(){
		var self = this;
		var answerChoicesPercentages = self.get("answerChoicesPercentages").nextObject(0);
		
		if (answerChoicesPercentages.correctValues) {
			answerChoicesPercentages.correctValues.forEach(function(points, index) {
				var className = "click-ok-"+ self.get("idQuestion") +"-"+ index; 
				var $div = $("<div class='click-ok "+ className + "'>");
				$(".select-point-"+ self.get('idQuestion')).append($div);
				self.movePosition(points[0], points[1], "." + className, 10, 10);
			});
		}
		if (answerChoicesPercentages.incorrectValues) {
			answerChoicesPercentages.incorrectValues.forEach(function(points, index) {
				var className = "click-wrong-"+ self.get("idQuestion") +"-"+ index; 
				var $div = $("<div class='click-wrong "+ className + "'>");
				$(".select-point-"+ self.get('idQuestion')).append($div); 
				self.movePosition(points[0], points[1], "."+className, 10, 10);
			});
		}
	},

	/**
	* Generic function to move the object to specific x,y
	**/
	movePosition: function(x, y, objectSelector, width, height){
		var self = this, proportional_x = 0, proportional_y = 0;
		
 		proportional_x = self.convertToProportionalPositionOrSize(self.get("proportionalWidth"), self.get("realWidth"), x);
 		proportional_y = self.convertToProportionalPositionOrSize(self.get("proportionalHeight"), self.get("realHeight"), y);

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
		if (point < 0){
			point = 0;
		}
		else if ((point + (half_size_box * 2)) > maxValue){ //If the point is > than total size
			point = maxValue - (half_size_box * 2); 
		}
		return point;
	},

	/*
     * === EVENTS
     */

    /**
    * Get Real Size of Image and the Proportional Image, because the system have mobile suport 
    * and maybe the image change the size
    **/
    didInsertElement: function() {
        var self = this;
        
    	var img = $("#img-" + self.get("idQuestion")); // Get my img elem
		//Get real size
		$("<img/>") // Make in memory copy of image to avoid css issues
		    .attr("src", $(img).attr("src"))
		    .load(function() {
		    	if (!self.get("isDestroyed")) {
		    		 //Get Proportional size
		    		self.set("proportionalWidth", $("#img-" + self.get("idQuestion")).width());   
					self.set("proportionalHeight", $("#img-" + self.get("idQuestion")).height()); 

					//Get Real size
			        self.set("realWidth", this.width);   // Note: $(this).width() will not
			        self.set("realHeight", this.height);  // work for in memory images
			       
			        self.set("imageLoaded", true);
			    }
            });
    },

    /**
	* Convert to proportional x and Y
	**/
    convertToProportionalPositionOrSize: function(proportionalSize, realSize, realPosition){
    	return (proportionalSize * realPosition) / realSize;
    },


});