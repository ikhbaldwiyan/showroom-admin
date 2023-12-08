exports.responseSuccess = (statusCode, message, data = null) => {
  let response = {
    meta: {
      code : statusCode,
      success: true,
      message: message,
    }
  }

  if(data){
    response['data'] = data
  }

  return response
}