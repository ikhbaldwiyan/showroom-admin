const User = require("../models/User");
const Activity = require("../models/Activity");
const { responseSuccess, responseError } = require("../utils/response");


exports.getLeaderboard = async (req, res) => {

  let statusCode = 500,
    response = responseError(statusCode, 'Internal Server Error')

  try {

    const { limit, page } = req.query;

    const limitData = limit ?? 10
    const pageData = page ?? 1

    const totalData = await User.countDocuments({})
    const totalPage = Math.ceil(totalData/ limitData)

    const users = await User.find()
      .select('_id name user_id avatar totalWatchLive watchLiveIDN watchShowroomMember')
      .sort({totalWatchLive: -1})
      .skip((pageData - 1) * limitData)
      .limit(limitData)
      .exec()

      let userData = {
        data: users,
        pagination: {
          currentPage: parseInt(pageData),
          limit: parseInt(limitData),
          totalData,
          totalPage
        }
      }

    response = responseSuccess(200, 'Success', userData)
    
  } catch (error) {
    console.log(error)
    statusCode = 400
    response = responseError(statusCode, error.message)
  }

  return res.status(statusCode).json(response)
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  const leaderboard = users.sort((a, b) => b.level - a.level);

  const leaderboardData = leaderboard.slice(0, 10).map((user) => ({
    name: user.name,
    points: user.points,
    experience: user.experience,
    level: user.level,
  }));

  res.json(leaderboardData);
}

exports.seeeder = async () => {

  const limit = 200
    const page = 11

    console.log('Start running')

    let beforeTime = await new Date()

    let totaldata = await User.countDocuments({})
    let totalPage = Math.ceil(totaldata / limit)

    const users = await User.find()
      .select('_id name')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()
    
    for (let user of users){

      console.log('start find user')

      const watchLiveIDN = await Activity.find({$and: [
        {log_name: 'Watch'},
        {description: {$regex: 'watch IDN', $options: 'i'}},
        {user: user._id}
      ]})
      .select('_id log_name description')
      .countDocuments({})
      
      const watchLiveShowroom = await Activity.find({$and: [
        {log_name: 'Watch'},
        {description: {$regex: 'watch live', $options: 'i'}},
        {user: user._id}
      ]})
      .select('_id log_name description')
      
      const watchLiveMultiroom = await Activity.find({$and: [
        {log_name: 'Watch'},
        {description: {$regex: 'Watch Multi Room', $options: 'i'}},
        {user: user._id}
      ]})
      .select('_id log_name description')
      .countDocuments({})

      let watchLiveOfficialJKTShowroom = 0
      let watchShowroomMember = 0
      
      for ( let liveShowroom of watchLiveShowroom ){
        if(liveShowroom.description.includes('SHOWROOM')) watchLiveOfficialJKTShowroom += 1
        else watchShowroomMember +=1
      }

      let totalWatchLive =  watchLiveIDN + watchLiveOfficialJKTShowroom + watchShowroomMember + watchLiveMultiroom

      const dataLiveCount = {
        watchLiveIDN,
        watchLiveOfficialJKTShowroom,
        watchShowroomMember,
        watchLiveMultiroom,
        totalWatchLive
      }

      await User.findOneAndUpdate({_id: user._id }, {$set: dataLiveCount})

      console.log('finish update user')
    }

    let userData = {
      // data: users,
      pagination: {
        currentPage: page,
        limit: limit,
        totaldata,
        totalPage
      }
    }

    console.log('User', userData)

    let afterTime = await new Date()

    let totalTime = afterTime - beforeTime

    console.log(`Get Activity Log and update user , Execution Time ${totalTime} ms`)

}
