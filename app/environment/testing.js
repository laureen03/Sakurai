import Environment from "sakurai-webapp/environment/environment";
/**
 * This class configures the testing application environment, like properties
 * @type {TestingEnvironment}
 */
export default Environment.extend({

    propertiesOverrides: {
        restAdapter: {
            namespace: 'stubby'
        },

        // Uncomment for debugging tests
        //logLevels: ["error", "warn", "info", "log", "debug"],
        logLevels: ["error", "warn"],

        quizzer: {
            animationTimeout: 0 //ms for the timeout
        },

        lww: {
            baseUrl: "http://testing"
        }
    }
});
