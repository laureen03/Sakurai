
import DS from 'ember-data';
import AuthKey from "sakurai-webapp/models/auth-Key";

export default DS.Model.extend({
    username: DS.attr('string'),
    password: DS.attr('string'),
    token: DS.attr('string'),
    refreshToken: DS.attr('string'),
    expiresIn: DS.attr('number'),
    user: DS.belongsTo('user', { async: true }),
    publisher: DS.belongsTo('publisher', { async: true }),
    publisherName: DS.attr('string'),
    productISBN: DS.attr('string'),

    /**
     * This property is used by the sso
     * It contains the product selected while authenticating
     * @property {Product}
     */
    product: DS.belongsTo('product', { async: true })
});

/**
 * Adds convenience methods to the User model
 */
AuthKey.reopenClass({

    /**
     * Sends a refresh token request
     * @param store
     * @param {string} token
     * @param {string} publisherName publisher name
     * @param {string} isbn isbn
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    refresh: function(store, token, publisherName, isbn){
        //Ember.logger.debug("Refreshing token: " + token);
        isbn = (isbn == null)? undefined: isbn;
        return store.query("authKey", { refreshToken: token, publisherName: publisherName, isbn: isbn, refresh: true})
            .then(function(authKeys){
                return authKeys.nextObject(0);
            });
    },

    /**
     * Sends a sso request
     * @param store
     * @param token
     * @param product
     * @param templateId
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    sso: function(store, token, product, templateId){
        return store.query("authKey", { token: encodeURIComponent(token), product: product, sso: true, templateId: templateId})
            .then(function(authKeys){
                return authKeys.nextObject(0);
            });
    },

    /**
     * Sends a mimic user request
     * @param store
     * @param token
     * @param publisherName
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    mimic: function(store, token, publisherName){
        return AuthKey.refresh(store, token, publisherName);
    }



});
