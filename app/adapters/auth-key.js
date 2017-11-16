import DS from "ember-data";

export default DS.RESTAdapter.extend({
	shouldBackgroundReloadRecord:function() {
        return false;
    },

    query: function(store, type, query) {
        if (query.sso){
            delete query.sso;
            return this.doSSORequest(store, type, query);
        }
        else if (query.refresh){
            delete query.refresh;
            return this.doRefreshRequest(store, type, query);
        }
        else{
            return this._super(store, type, query);
        }
    },

    /**
     * Does a sso request, this request doesn't follow ember convention
     * @param store
     * @param type
     * @param query
     * @returns {*}
     */
    doSSORequest: function(store, type, query){
        var url = this.buildURL(type.modelName) + "/sso";
        var params = "token=" + query.token + "&product=" + query.product;
        
        //Validate templateId
        if (query.templateId != null){
            params = params + "&templateId=" + query.templateId;
        }

        url = url + "?" + params;
        return this.ajax(url, 'GET', {}).then(function(response){
            response.data = [response.data]; //the backend return a single entity, ember expects an array
            return response;
        });
    },

    /**
     * Does a refresh token request, this request doesn't follow ember convention
     * @param store
     * @param type
     * @param query
     * @returns {*}
     */
    doRefreshRequest: function(store, type, query){
        var url = this.buildURL(type.modelName) + "/authRefresh";
        return this.ajax(url, 'GET', { data: query }).then(function(response){
            response.data = [response.data]; //the backend return a single entity, ember expects an array
            return response;
        });
    }

});