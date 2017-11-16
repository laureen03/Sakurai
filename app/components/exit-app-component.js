import Ember from "ember"; 
import context from "utils/context";

export default Ember.Component.extend({
    actions: {
        redirectToThePoint: function(){
            //Redirect the user once is exit the application
            //used only for framed version on mobile
            //Url Builded from environment.js
            
            var lwwProperties = context.get("environment").getProperty("lww");
            var thePointUrl = lwwProperties.baseUrl + lwwProperties.contentUrlPath;
            window.location = thePointUrl;
        }
    }
});