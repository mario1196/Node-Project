const RequestService = require("../services/RequestService");

exports.Index = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  
  response.render("index", {title: "Home", reqInfo: reqInfo})
};