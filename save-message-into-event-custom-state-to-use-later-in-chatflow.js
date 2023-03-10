exports.main = (event, callback) => {

    const additionalInformation = event.userMessage.message;
  
    const responseJson = {
      responseExpected: false,
      customState: {additionalInformation: `${additionalInformation}`}
    }
  
    callback(responseJson);
  };