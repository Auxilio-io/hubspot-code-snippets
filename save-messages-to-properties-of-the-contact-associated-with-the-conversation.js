var request = require("request");

exports.main = (event, callback) => {
  
  const query = event.userMessage.message;
  const contactId = event.session.vid;
  const opsToken = process.env['OPS_TOKEN']
  
  var options = { method: 'PATCH',
    url: `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
    headers: 
     {'Content-Type': 'application/json', 
      'authorization': `Bearer ${opsToken}`},
    body: {
      properties: {
        last_knowledge_base_lookup_query_in_bots: query
      }
     },
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