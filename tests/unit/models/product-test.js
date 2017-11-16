import { moduleForModel, test } from 'ember-qunit';

moduleForModel('Product', 'Unit | Model | Product', {
  // Specify the other units that are required for this test.
  needs: [
  		'model:class',
        'model:school',
        'model:user',
        'model:product'
   	]
});

test('Testing termTaxonomiesAllowedForQuizzing', function(assert) {
  var product = this.subject(
        {
            name: "Test",
            settings: {
                "taxonomySettings":{
                    "allowedTypes": [
                        {"key" : "client_needs", "setting": "quiz", "label": "Client Needs"},
                        {"key" : "nursing_concepts", "setting": "quiz", "label": "Nursing Concepts"},
                        {"key" : "blooms", "setting": "tag", "label": "Blooms"}
                    ]
                }
            }

        });
    var forQuizzing = product.get("termTaxonomiesAllowedForQuizzing");

    assert.equal(forQuizzing.length, 2, "Missing items");
    assert.equal(forQuizzing[0].setting, "quiz", "Wrong setting value for [0]");
    assert.equal(forQuizzing[1].setting, "quiz", "Wrong setting value for [1]");
});
