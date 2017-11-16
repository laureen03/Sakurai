import Ember from 'ember';
import AuthKey from 'sakurai-webapp/models/auth-key';
import context from "sakurai-webapp/utils/context";

/**
 * TODO: replace for https://github.com/simplabs/ember-simple-auth once oauth is working
 * @type {*}
 */
export default Ember.Object.extend({

    AUTH_TOKEN_COOKIE_NAME: "auth_token",
    IMPERSONATE_COOKIE_USER_ID: "impersonate_user_id",
    AUTH_CLASS_COOKIE_NAME: "auth_class",
    AUTH_PUBLISHER_COOKIE_NAME: "auth_publisher",
    AUTH_REFRESH_TOKEN_COOKIE_NAME: "auth_refresh_token",
    AUTH_OPTIONS_COOKIE_NAME: "auth_options",
    AUTH_ISBN_COOKIE_NAME: "auth_isbn",
    PRODUCT_TAG: "product_tag",

    /**
     * @property {string} refresher id, see Ember.run.later
     */
    refresher: null,

    /**
     * @property boolean indicates if the user is authenticated or not
     */
    authenticated: false,

    /**
     * @property refresh token interval
     */
    refreshTokenInterval: null,

    /*
    * @property with authentication object
    */
    authKey: null,

    /*
    * @property with impersonated id
    */
    impersonatedId: null,

    /*
    * @property with Product Tag value
    */
    productTag: null,

    /**
     * @property {boolean} indicates when it is a mimic user session
     */
    mimic: false,

    /**
     * @property {boolean} indicates when it is a sso session or not
     */
    sso: false,

    /**
     * @property {string} product isbn selected during sso
     */
    isbn: null,

    productISBN: null,

    /**
     * @property {bool} indicates when it is deep linking
     */
    deepLinking: false,

    /**
     * @property {bool} indicates when it is a student view
     */
    studentView: false,

    /**
     * Indicates if the current user is impersonating another account
     * @property {bool}
     */
    isImpersonated: Ember.computed("impersonatedId", function(){
        // var impersonate = this.get("impersonatedId");
        if (this.get("impersonatedId")) {
            return true;
        } else {
            return false;
        }
    }),

    /**
     * Indicates product tag if it exist
     * @property {string}
     */
    taxonomyTag: Ember.computed("productTag", function(){
        if (this.get("productTag")){
            return this.get("productTag");
        }
        else{
            return undefined;
        }
    }),

    /**
     * Observes for manager options so it is persisted in the storage and can be restore on refresh
     */
    optionsObserver: Ember.observer('mimic', 'sso', 'isbn', 'deepLinking', 'studentView', function() {
        var manager = this;
        if ( (manager.get('isDestroyed') || manager.get('isDestroying')) ){ return; }

        if (!this.isAuthenticated()) {
            manager._clearStorage();
        } else {
            var options = {
                sso: manager.get("sso"),
                mimic: manager.get("mimic"),
                isbn: manager.get("isbn"),
                deepLinking: manager.get("deepLinking"),
                studentView: manager.get("studentView")
            };
            manager._setOptionsInStorage(options);
        }
    }),


    /**
     * Is authenticated
     * @method isAuthenticated
     * @returns {boolean}
     */
    isAuthenticated: function() {
        return  !Ember.isEmpty(this.get('authKey')) &&
                !Ember.isEmpty(this.get('authKey.token')) &&
                !Ember.isEmpty(this.get('authKey.user'));
    },

    /**
     * Authenticates the key in the application context
     *
     * @method authenticate
     * @param {AuthKey} authKey authorization key object
     * @param {{}} options { sso: boolean, isbn: string, mimic: boolean }
     */
    _authenticate: function(authKey, options) {

        var _options = options || {},
            manager = this;

        //sets the token for all requests
        return new Ember.RSVP.Promise(function(resolve){
            Ember.RSVP.hash({
                product: authKey.get("product"),
                publisher: authKey.get("publisher"),
                user: authKey.get("user"),
                isbn: authKey.get("productISBN")
            }).then(function(){
                manager.set('authKey', authKey);
                manager.setProperties(_options);
                manager._setHeaders(authKey.get('token'));
                manager._initTokenRefresher();
//                manager._initInactivityMonitor();
                resolve();
            });
        });
    },

    /**
     * Returns the number of seconds when the token expires
     * @returns {number}
     * @private
     */
    _getExpiresIn: function(){
        var authKey = this.get("authKey");
        var expiresIn = authKey.get('expiresIn') || 3600;
        return expiresIn;
    },

    /**
     * Initializes the token refresher, to get a new token before it expires
     * @private
     */
    _initTokenRefresher: function(){
        var manager = this;
        var refreshIn = (manager._getExpiresIn() * 1000) - 5000; //five seconds before it expires
        Ember.Logger.debug("Refresh token in " + refreshIn);
        var refreshTokenInterval =  setInterval(function(){
            var store = context.getStore(),
                authKey = manager.get("authKey"),
                refreshToken = authKey.get("refreshToken"),
                publisher = authKey.get("publisher").get("name"),
                isbn = authKey.get("productISBN");

            AuthKey.refresh(store, refreshToken, publisher, isbn).then(function(refreshed) {
                if (refreshed){
                    authKey.set('token', refreshed.get("token"));
                    authKey.set('refreshToken', refreshed.get("refreshToken"));
                    authKey.set('expiresIn', refreshed.get("expiresIn"));

                    manager._setHeaders(authKey.get("token"));
                    manager._setAuthKeyInStorage(authKey);
                }
            });
        }, refreshIn);

        manager.set("refreshTokenInterval", refreshTokenInterval);
    },

    authenticate: function(store, email, password, publisherName){
        var manager = this;
        return new Ember.RSVP.Promise(function(resolve){
            var authKey = store.createRecord("authKey", {
                username: email,
                password: password,
                publisherName: publisherName
            });
            var promise = authKey.save();

            promise.then(function(authKey){
                manager.reset();
                manager._authenticate(authKey).then(function(){
                    resolve(manager.isAuthenticated());
                });
            },function(){
                resolve(manager.isAuthenticated());
            });
        });
    },
    /**
     * Tries to authenticate from storage
     * @param store
     * @returns {Ember.RSVP.Promise} fullfills { fromStorage: true|false, authenticated:true|false}
     */
    authenticateFromStorage: function(store){
        var manager = this;
        Ember.Logger.debug("Authenticating from storage");
        return new Ember.RSVP.Promise(function(resolve){
            var refreshToken = manager.getRefreshTokenFromStorage();
            manager._setHeaders(manager.getTokenFromStorage());
            if (refreshToken !== undefined){
                var publisher = manager.getPublisherFromStorage();

                manager.set("impersonatedId", manager.getImpersonateFromStorage());
                manager.set("productTag", manager.getProductTagFromStorage());

                var options = manager.getOptionsFromStorage();
                Ember.RSVP.hash({
                        "authKey": AuthKey.refresh(store, refreshToken, publisher, options.isbn)
                }).then(function(hash){
                        manager._authenticate(hash.authKey, options).then(function(){
                            resolve({ fromStorage: true, authenticated:manager.isAuthenticated()});
                        });
                    },
                    function (){ //failure
                        manager.reset();
                        resolve({ fromStorage: true, authenticated: false });
                    }
                );
            }
            else{
                Ember.Logger.debug("No token found in storage");
                resolve({ fromStorage: true, authenticated:false});
            }
        });
    },

    /**
     * Sets authorization header
     * @param token
     * @private
     */
    _setHeaders: function(token){

        var headers = {
            'Authorization': 'Bearer ' + token,
            'X-Authorization': 'Bearer ' + token
        };

        var isbn;
        var manager = this,
            authKey = manager.get("authKey");
        if(authKey) {
          isbn = authKey.get("productISBN");
          manager.setProductISBN(isbn);
        } else {
          isbn = manager.getProductISBNFromStorage();
        }
        $.extend(headers, { 'Sakurai-ISBN' : isbn } );

        $.ajaxSetup({
            headers: headers
        });

    },

    // Log out the user
    reset: function() {
        this.set('authKey', null);
        this.set("impersonatedId", null);
        this.set("sso", false);
        this.set("mimic", false);
        this.set("studentView", false);
        this.set("deepLinking", false);
        this.set("isbn", null);
        this.set("productTag", null);
        this._setHeaders("none");
        clearTimeout(this.get("refreshTokenInterval"));
    },

    //Observes the auth key
    authKeyObserver: Ember.observer('authKey', function() {
        var manager = this;
        if ( (manager.get('isDestroyed') || manager.get('isDestroying')) ){ return; }

        if (!this.isAuthenticated()) {
            manager._clearStorage();
            manager.set("authenticated", false);
        } else {
            var authKey = this.get("authKey");
            Ember.RSVP.Promise.all([ authKey.get('user'), authKey.get('publisher') ]).then(
                function(){
                    manager._setAuthKeyInStorage(authKey);
                    manager.set("authenticated", true);
                });
        }
    }),

    /**
     * Indicates if the current session is sso
     */
    isSSO: function(){
        return this.isAuthenticated() && this.get("sso");
    },

    /**
     * Indicates if the current session is sso
     */
    isStudentView: Ember.computed("authKey", "studentView", function(){
        return this.isAuthenticated() && this.get("studentView");
    }),

    /**
     * Adds a function to listen for the authentication manager state
     * @param callback {Function}
     */
    addAuthKeyObserver: function(callback){
        this.addObserver('authenticated', callback);
    },

    getCurrentUser: function(){
        if (this.isAuthenticated()){
            var authKey = this.get("authKey");
            return authKey.get('user');
        }
        return;
    },

    /**
     * Return the current Id and ask if is a Impersonated User
     *
     */
    getActiveUserId: function(){
        var manager = this;
        if (manager.get("impersonatedId")){
            return manager.get("impersonatedId");
        }
        else{
            return manager.getCurrentUser().get('id');
        }
        return;
    },

    getCurrentUserId: function(){
        if (this.isAuthenticated()){
            return this.getCurrentUser().get('id');
        }
        return;
    },

    getCurrentToken: function(){
        if (this.isAuthenticated()){
            var authKey = this.get("authKey");
            return authKey.get('token');
        }
        return;
    },

    getCurrentPublisher: function(){
        if (this.isAuthenticated()){
            var authKey = this.get("authKey");
            return authKey.get('publisher');
        }
        return;
    },

    /**
     * Gets the current product, only use for sso authentication
     * @returns {Product}
     */
    getCurrentProduct: function(){
        if (this.isSSO()){
            var authKey = this.get("authKey");
            return authKey.get('product');
        }
        return;
    },

    getAuthKey: function(){
        if (this.isAuthenticated()){
            return this.get("authKey");
        }
        return;
    },

    getTokenFromStorage: function(){
        var cookie = $.cookie(this.AUTH_TOKEN_COOKIE_NAME);
        Ember.Logger.debug("Token from storage", cookie);
        return cookie;
    },

    getRefreshTokenFromStorage: function(){
        var cookie = $.cookie(this.AUTH_REFRESH_TOKEN_COOKIE_NAME);
        Ember.Logger.debug("Refresh token from storage", cookie);
        return cookie;
    },

    getPublisherFromStorage: function(){
        var cookie = $.cookie(this.AUTH_PUBLISHER_COOKIE_NAME);
        Ember.Logger.debug("Publisher from storage", cookie);
        return cookie;

    },

    getImpersonateFromStorage: function(){
        var cookie = $.cookie(this.IMPERSONATE_COOKIE_USER_ID);
        Ember.Logger.debug("Impersonate from storage", cookie);
        return cookie;
    },

    /**
     * Gets the options from storage
     * @returns {*}
     */
    getOptionsFromStorage: function(){
        var cookie = $.cookie(this.AUTH_OPTIONS_COOKIE_NAME);
        Ember.Logger.debug("Options from storage", cookie);
        return cookie ? JSON.parse(cookie): {};
    },

    getClassFromStorage: function(){
        var classId = $.cookie(this.AUTH_CLASS_COOKIE_NAME);
        Ember.Logger.debug("Class from storage", classId);
        return  classId ? parseInt(classId): false;
    },

    getProductTagFromStorage: function(){
        var productTag = $.cookie(this.PRODUCT_TAG);
        Ember.Logger.debug("Product Tag from storage", productTag);
        return  productTag ? productTag: false;
    },

    getProductISBNFromStorage: function(){
        var isbn = $.cookie(this.AUTH_ISBN_COOKIE_NAME);
        Ember.Logger.debug("Product ISBN from storage", isbn);
        return  isbn ? isbn: false;
    },


    /**
     * Sets cookie values
     * @param {AuthKey} authKey
     * @private
     */
    _setAuthKeyInStorage: function(authKey){
        var manager = this;
        //var expiresIn = manager._getExpiresIn();
        var currentPublisher = authKey.get('publisher');

        $.cookie(manager.AUTH_TOKEN_COOKIE_NAME, authKey.get("token"));
        $.cookie(manager.AUTH_REFRESH_TOKEN_COOKIE_NAME, authKey.get("refreshToken"));
        $.cookie(manager.AUTH_PUBLISHER_COOKIE_NAME, currentPublisher.get('name'));
    },

    /**
     * Sets options in storega
     * @param {{}} options
     * @private
     */
    _setOptionsInStorage: function(options){
        var manager = this;
        //var expiresIn = manager._getExpiresIn();

        //var expirationDate = new Date();
        //expirationDate.setTime(expirationDate.getTime() + (expiresIn * 1000));
        $.cookie(manager.AUTH_OPTIONS_COOKIE_NAME, JSON.stringify(options));
    },

    /**
     * Sets the impersonated id in the storage
     * @param {number} id
     * @private
     */
    _setImpersonatedIdInStorage: function(id){
        var manager = this;
        var expiresIn = manager._getExpiresIn();
        var expirationDate = new Date();

        expirationDate.setTime(expirationDate.getTime() + (expiresIn * 1000));

        $.cookie(manager.IMPERSONATE_COOKIE_USER_ID, id, { expires: expirationDate });
    },

    /**
     * Sets the product tag in the storage
     * @param {string} tag
     * @private
     */
    _setProductTagInStorage: function(tag){
        var manager = this;
        var expiresIn = manager._getExpiresIn();
        var expirationDate = new Date();

        expirationDate.setTime(expirationDate.getTime() + (expiresIn * 1000));

        $.cookie(manager.PRODUCT_TAG, tag, { expires: expirationDate });
    },


    /**
     * Sets class id in storage
     * @param {number} id
     * @private
     */
    _setClassInStorage: function(id){
        var manager = this;
        var expiresIn = manager._getExpiresIn();
        var expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (expiresIn * 1000));
        $.cookie(manager.AUTH_CLASS_COOKIE_NAME, id, { expires: expirationDate });
    },

    /**
     * Sets product ISBN in storage
     * @param {string} isbn
     * @private
     */
    _setISBNInStorage: function(isbn){
        var manager = this;
        var expiresIn = manager._getExpiresIn();
        var expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (expiresIn * 1000));
        $.cookie(manager.AUTH_ISBN_COOKIE_NAME, isbn, { expires: expirationDate });
    },

    /**
     * Sets the impersonated user id
     * @param {number} id
     */
    setImpersonatedUser: function(id){
        var manager = this;
        manager.set("impersonatedId", id);
        manager._setImpersonatedIdInStorage(id);
    },

    /**
     * Sets the concepts tag value
     * @param {string} productTag
     */
    setProductTag: function(productTag){
        var manager = this;
        manager.set("productTag", productTag);
        manager._setProductTagInStorage(productTag);
    },

    /**
     * Sets current class
     * @param {number} id
     */
    setCurrentClass: function(id){
        var manager = this;
        manager._setClassInStorage(id);
    },

    /**
     * Sets product ISBN
     * @param {string} isbn
     */
    setProductISBN: function(isbn){
        var manager = this;
        manager._setISBNInStorage(isbn);
    },


    /**
     * Clears the current class
     */
    clearCurrentClass: function(){
        $.removeCookie(this.AUTH_CLASS_COOKIE_NAME);
    },

    /**
     * Clear storage values
     * @private
     */
    _clearStorage: function(){
        $.removeCookie(this.AUTH_TOKEN_COOKIE_NAME);
        $.removeCookie(this.AUTH_REFRESH_TOKEN_COOKIE_NAME);
        $.removeCookie(this.AUTH_PUBLISHER_COOKIE_NAME);
        $.removeCookie(this.IMPERSONATE_COOKIE_USER_ID);
        $.removeCookie(this.AUTH_CLASS_COOKIE_NAME);
        $.removeCookie(this.AUTH_OPTIONS_COOKIE_NAME);
        $.removeCookie(this.PRODUCT_TAG);
    }

});
