import Environment from "sakurai-webapp/environment/environment";
/**
 * This class configures the production application environment, like properties
 * @type {ProductionEnvironment}
 */
export default Environment.extend({

    propertiesOverrides: {
        restAdapter:{
            namespace: 'api'
        },
        logLevels: ["error", "warn", "info"],
        lww: {
            baseUrl: "http://thepoint1.technotects.com"
        }
    }

});
