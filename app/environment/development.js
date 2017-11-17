
/**
 * This class configures the development environment
 * @type {DevelopmentEnvironment}
 */
SakuraiWebapp.DevelopmentEnvironment = SakuraiWebapp.Environment.extend({

    /**
     * @property {Object} override default environment settings
     * Similar to the settings property in SakuraiWebapp.Environment,
     * this property is inherited by classes that extend from it
     * (e.g. SakuraiWebapp.VagrantEnvironment). To override or
     * extend this property, another property is available named
     * 'devOverrides' which should be used by these classes
     * instead.
     */
    propertiesOverrides: {
        restAdapter: {
            namespace: 'app_dev.php/1',
            host: 'http://127.0.0.1:8081'
        },

        logLevels: ["error", "warn", "info", "log", "debug"],

        session: {
            inactivityCountdown: 1800     // 30 minutes
        },

        lww: {
            baseUrl: "http://development"
        }
    },

    mergeOverrides: function() {
        var properties = this.get('propertiesOverrides'),
            overrides = this.get('devOverrides');

        $.extend(true, properties, overrides);
        this.set('propertiesOverrides', properties);
    },

    init: function() {
        this.mergeOverrides();

        // Call SakuraiWebapp.Environment init method
        this._super();
    }
});

/**
 * This class configures the development environment
 * @type {VagrantEnvironment}
 */
SakuraiWebapp.VagrantEnvironment = SakuraiWebapp.DevelopmentEnvironment.extend({

    devOverrides: {
        restAdapter: {
            host: 'http://172.20.0.15:9090'
        }
    }

});

/**
 * This class configures the development environment
 * @type {UatEnvironment}
 */
SakuraiWebapp.UatEnvironment = SakuraiWebapp.DevelopmentEnvironment.extend({

    devOverrides: {
        restAdapter: {
            namespace: '1',
            host: 'https://sakurai-api-uat.prep-u.com/'
        }
    }

});



