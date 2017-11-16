
import DS from "ember-data";
import Ember from "ember";

export default DS.RESTSerializer.extend({

    isNewSerializerAPI: true,

    /**

     /**
     * Sakurai Responses looks like
     *
     * {
     *     errors: [{ "code": "user_not_found", "message":"User jperez not found"}, {...}],
     *     data: { "id": 1, "name": "javier"},
     *     sideLoaded: ["comments": [{ id:1, text:"A"}, {}]]
     * }
     *
     * So here we convert the sakurai answer into the format expected by Ember
     *
     * {
     *    user: {
     *      "id": 1,
     *      "name": "javier",
     *      "comment": 1
     *    },
     *    "comments": [
     *      { id: 1, "text":"A"}
     *    ]
     *    "meta": {
     *          errors: [{ "code": "user_not_found", "message":"User jperez not found"}, {...}]
     *    },
     *
     * }
     *
     * @param type
     * @param payload
     * @returns {{}}
     */

     transformPayload: function(type, payload){
        var data = payload.data;
        var sideLoaded = payload.sideLoaded || {};
        var meta = payload.metadata || {};
        //Create data with main info
        var normalized = this._normalizeData(type, data);
        //Set metadata with JSONAPI structure
        normalized["meta"] = meta;
        //Add "included" with all info about sideloader
        return  this._normalizeSideLoaded(normalized, sideLoaded);
    },

    /**
     * Overrides the default logic
     * @param store
     * @param type
     * @param payload
     * @param id
     * @returns {*}
     */
    normalizeSingleResponse: function(store, type, payload, id) {
        return this._super(store, type, this.transformPayload(type, payload), id);
    },

    /**
     * Overrides default logic
     * @param store
     * @param type
     * @param payload
     * @returns {*}
     */
    normalizeArrayResponse: function(store, type, payload) {
        return this._super(store, type, this.transformPayload(type, payload));
    },

    /**
     * Overrides ember's extractMeta
     * @param store
     * @param type
     * @param payload
     */
    extractMeta: function(store, type, payload) {
        try {
            var meta = payload.meta || {};
            meta["errors"] = payload.errors || {};
            if (payload) {
                store._setMetadataFor(type.modelName, meta); //TODO this will not work for ember-data 2.0
                delete payload.meta;
            }
        } catch (e) {
            Ember.Logger.error(e);
        }
    },

    /**
     * Normalizes the data section of the response
     * @param type
     * @param data
     * @returns {{}}
     * @private
     */
    _normalizeData: function(type, data){
        var payload = {};
        var rootKey = $.isArray(data) ? Ember.String.pluralize(type.modelName) : type.modelName ;
        payload[rootKey] = data;
        return payload;
    },

    /**
     * Normalizes the side loaded data of the response
     * @param normalized
     * @param sideLoaded
     * @returns {*}
     * @private
     */
    _normalizeSideLoaded:function(normalized, sideLoaded){
        $.each(sideLoaded, function(key, data){
            normalized[key] = data;
        });

        return normalized;
    },


    /**
     * Create a JSON with structure of JSONAPI http://jsonapi.org/
     * @param type
     * @param data
     * @returns {*}
     * @private
     */
    createJSONApiObject: function(type, data, store){
        var jsonAPIObj = {};
        var model = store.modelFor(type);
        jsonAPIObj["id"] = data.id;
        jsonAPIObj["type"] = type;
        jsonAPIObj["attributes"] = {};
        //Insert Attributes
        model.eachAttribute(function(name, meta) {
            jsonAPIObj.attributes[meta.name] = data[meta.name];
        });

        //Add RelationShips
        jsonAPIObj["relationships"]={};
        model.eachRelationship(function(relationship, meta) {
            if (meta.kind === "belongsTo"){ //Only one Object for this relationship
                if (data[meta.key] !== undefined){ //Avoid relationships with empty values
                    jsonAPIObj.relationships[meta.key] = {"data":{"id":data[meta.type],"type":meta.type}};
                }
            }
            else //HasMany is an array
            {
                var array_has_many_relation = [];
                if(data[meta.key]){
                    $.each(data[meta.key], function(index, data_id){
                        array_has_many_relation.push({"id":data_id, "type":Ember.String.pluralize(meta.type)});
                    });
                }
                jsonAPIObj.relationships[meta.key] = {"data":array_has_many_relation};
            }
        });

        return jsonAPIObj;
    },

    keyForAttribute: function (attr) {
        return Ember.String.camelize(attr);
    },

    keyForRelationship: function (key) {
        return Ember.String.camelize(key);
    },

    /**
     * Sakurai backend doesn't follow ember convention 100%, it doesnt need the root key to be setup
     * This method removes the root key from the hash
     * @param hash
     * @param type
     * @param record
     * @param options
     */
    serializeIntoHash: function(hash, type, record, options) {
        var serialized = this.serialize(record, options);
        $.extend(hash, serialized);
    }
});
