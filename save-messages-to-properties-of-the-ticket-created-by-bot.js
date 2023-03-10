const request = require('request');
const http = require('https');
const util = require('util');

exports.main = async (event, callback) => {
  const query = event.session.customState.query;
  const additionalInformation = event.session.customState.additionalInformation;
  const contactId = event.session.vid;
  const opsToken = process.env['OPS_TOKEN'];
  var ticketId;
  var ticketWithCreateDate;
  var ticketsWithCreateDate = [];
  console.log(contactId);

  // Find tickets associated to the contact

  var options = {
    method: 'GET',
    hostname: 'api.hubapi.com',
    port: null,
    path: `/crm/v4/objects/contacts/${contactId}/associations/tickets?limit=500`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${opsToken}`,
    },
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', async function () {
      var body = Buffer.concat(chunks);
      const string = body.toString();
      const json = JSON.parse(string);
      const tickets = json.results;

      if (tickets.length < 1) {
        console.log('No ticket associated to this contact');
      } else {
        for (let ticket of tickets) {
          const ticketId = ticket.toObjectId;
          var options = {
            method: 'GET',
            url: `https://api.hubapi.com/crm-objects/v1/objects/tickets/${ticketId}?properties=createdate`,
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${opsToken}`,
            },
            json: true,
          };

          const requestAsync = util.promisify(request);
          try {
            const response = await requestAsync(options);
            console.log(response.statusCode);
            var ticketWithCreateDate = response.body;
            ticketsWithCreateDate.push(ticketWithCreateDate);
          } catch (error) {
            console.error(error);
          }
        }
        // find most recent ticket
        const latestTicket = ticketsWithCreateDate.reduce((a, b) => a.properties.createdate.timestamp > b.properties.createdate.timestamp ? a : b);	
        const latestTicketId = latestTicket.objectId	
        console.log(latestTicketId)
        
        // Update ticket description with query and additionalInformation
        
          var options = {
            method: 'PATCH',
            url: `https://api.hubapi.com/crm/v3/objects/tickets/${latestTicketId}`,
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${opsToken}`,
            },
            body: { 
              properties: { 
                content: `${query} ${additionalInformation}`
              }
            },
            json: true,
          };

          const requestAsync = util.promisify(request);
          try {
            const response = await requestAsync(options);
            console.log(response.statusCode);
            console.log(response.body)
          } catch (error) {
            console.error(error);
          }
      }
    });
  });

  req.end();

  const responseJson = {
    responseExpected: false,
  };

  callback(responseJson);
};
