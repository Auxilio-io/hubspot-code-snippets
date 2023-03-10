var request = require("request");

exports.main = (event, callback) => {
  
  const query = event.userMessage.message;
  const contactId = event.session.vid;
  const opsToken = process.env['OPS_TOKEN']
  
  var options = { method: 'POST',
    url: `https://api.hubapi.com/contacts/v1/contact/vid/${contactId}/profile`,
    headers: 
     {'Content-Type': 'application/json', 
      'authorization': `Bearer ${opsToken}`},
    body: 
     { properties: 
        [ { property: 'last_knowledge_base_lookup_query_in_bots', value: query } ] },
    json: true };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(response.statusCode);
    console.log(body);

  });


  const responseJson = {
    responseExpected: false,
    customState: {query: `${query}`}
  }

  callback(responseJson);
};