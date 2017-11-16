import Ember from 'ember';
import ControllerMixin from 'sakurai-webapp/mixins/controller';
import Context from '../utils/context';
import MobileUtil from 'sakurai-webapp/utils/mobile-util';

export default Ember.Controller.extend(
    ControllerMixin, {

    /**
    * Function to detect id is into the Iframe
    **/
    checkFrame: function() {
        /*
         * @see css_lww_instructor_interaction_spec.js
         * @see test_utils.js#enableFrame
         */
         debugger;
        if (Context.isTesting()){
            //tests modifies this property manually to reproduce the desired behavior
            return Context.get("isInFrame");
        }

        //if not testing check for
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },

    /**
     * Function to detect if the app is in a mobile device
     */
    checkMobile: function(){

        if (Context.isTesting()){
            //tests modifies this property manually to reproduce the desired behavior
            return Context.get("isInMobile");
        }

        return MobileUtil.isMobile();
    },

    /**
     * Sets the application module when the current path changes
     */
    currentPathDidChange: Ember.observer('currentPath', function() {
        var currentPath = this.get('currentPath');
        this.get('history').push(currentPath);
        Context.set("prevApplicationModule", Context.get("applicationModule"));
        Context.set("applicationModule", currentPath.replace(".", "-"));
    }),

    controllerSetup: function(){

        toastr.options = {
            "closeButton": false,
            "debug": false,
            "positionClass": "toast-top-full-width",
            "onclick": null,
            "showDuration": "200",
            "hideDuration": "800",
            "timeOut": "4000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };

        //Check if the App is running into Iframe
        Context.set("isInFrame", this.checkFrame());
        Context.set("isInMobile", this.checkMobile());
        this.verifyEnableDisableFrame();

    }.on('init'),

    /**
     * Enables or disables the frame
     */
    verifyEnableDisableFrame: function(){
        var clearFrameClasses = function(){
            $(".ember-application").removeClass("lww_frame");
            $(".ember-application").removeClass("lww_frame_common");
            $(".ember-application").removeClass("lww_frame_mobile");
            $(".ember-application").removeClass("in-frame");
        };
        clearFrameClasses();

        var isInFrame = this.get("isInFrame"); //@see controller mixing
        var isInMobile = this.get("isInMobile"); //@see controller mixing
        if (isInFrame){
            /*
                Adding a ccs class to indicate it is in a frame
                So far there are no specific rules for this behavior
             */
            $(".ember-application").addClass("in-frame");
            /*
             * Adding common rules for mobile and non mobile lww
             */
            $(".ember-application").addClass("lww_frame_common");

            if (!isInMobile){

                /*
                 * this class indicates if the app is in frame (LWW specific)
                 * some css rules will be applied because of this
                 * @see lww.scss
                 */
                $(".ember-application").addClass("lww_frame"); //indicates is lww in iframe

                Ember.Logger.info("Application is in frame, adding frame classes");
            }
            else{
                /*
                 * this class indicates if the app is in frame and mobile(LWW specific)
                 * So far no rules has been applied for this
                 * @see
                 */
                $(".ember-application").addClass("lww_frame_mobile");

                Ember.Logger.info("Application is in frame and mobile, adding frame classes");
            }


        }
        else{
            Ember.Logger.info("Application is not in frame");
        }
    },



    /**
     * Observer for the isInFrame property to change the css
     * This is necessary for tests only, in a real scenario there is no way an
     * app can go from frame to not frame version
     * @see test_utils.js#enableFrame
     */
    isInFrameOrMobileObserver: Ember.observer('Context.isInFrame', 'Context.isInMobile', function(){
        this.verifyEnableDisableFrame();
    }) //@see controller mixing

});
