SakuraiWebapp.ExitAppComponent = Ember.Component.extend(
{
    actions: {
        redirectToThePoint: function(){
            //Redirect the user once is exit the application
            //used only for framed version on mobile
            //Url Builded from environment.js
            var context = SakuraiWebapp.context;
            var lwwProperties = context.get("environment").getProperty("lww");
            var thePointUrl = lwwProperties.baseUrl + lwwProperties.contentUrlPath;
            window.location = thePointUrl;
        }
    }
});