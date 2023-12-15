const { default: axios } = require("axios");
const Notification = require("../models/Notification");
const { responseSuccess, responseError } = require("../utils/response");
const { DISCORD_API } = require("../utils/api");


exports.getUserRoles = async (req, res) => {
  try {
    axios
      .get(`${DISCORD_API}?limit=1000`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      })
      .then((response) => {

        let type = req.query.type
        let role_id;

        if(type == 'developer'){
          role_id = "1082078133563424860"
        }

        if(type == 'donator' || type == null || type == undefined) role_id = "1098626913188188241"


        let user = response.data.filter((item) => item.roles.includes(role_id))

        let result = responseSuccess(200, 'Success', user)

        res.status(200).send(result)
      }).catch(error => {

        let result = responseError(400, error)

        res.status(400).send(result)
      })
  } catch (err) {
    console.log(err);
    let result = responseError(500, 'Internal Server Error!')

    res.status(500).send(result)
  }
}