const request = require('request');
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
    url: `https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/tickets?limit=500`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${opsToken}`,
    },
    json: true,
  };

  const requestAsync = util.promisify(request);
  try {
    const response = await requestAsync(options);
    console.log(response.statusCode);
    const tickets = response.body.results;

    if (tickets.length < 1) {
      console.log('No ticket associated to this contact');
    } else {
      for (let ticket of tickets) {
        const ticketId = ticket.toObjectId;
        var options = {
          method: 'GET',
          url: `https://api.hubapi.com/crm/v3/objects/tickets/${ticketId}`,
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${opsToken}`,
          },
          json: true,
        };

        const response = await requestAsync(options);
        console.log(response.statusCode);
        var ticketWithCreateDate = response.body;
        ticketsWithCreateDate.push(ticketWithCreateDate);
      }
      // find most recent ticket
      const latestTicket = ticketsWithCreateDate.reduce((a, b) => a.createdAt > b.createdAt ? a : b);	
      const latestTicketId = latestTicket.id	
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

      const response = await requestAsync(options);
      console.log(response.statusCode);
      console.log(response.body);
    }
  } catch (error) {
    console.error(error);
  }

  const responseJson = {
    responseExpected: false,
  };

  callback(responseJson);
};
