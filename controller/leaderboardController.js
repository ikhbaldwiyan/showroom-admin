const User = require("../models/User");
const Activity = require("../models/Activity");
const { responseSuccess, responseError } = require("../utils/response");
const moment = require("moment");


exports.getLeaderboard = async (req, res) => {

  let statusCode = 500,
    response = responseError(statusCode, 'Internal Server Error')

  try {

    const { filterBy, platform } = req.query

    let sort = 'totalWatchLive'

    if(platform) {
      if(platform === 'Showroom') sort = 'watchShowroomMember'
      else if(platform === 'IDN') sort = 'watchLiveIDN'

      else throw new Error('Filter by platform must be Shworoom or IDN ')
    }

    // if(filterBy){

    //   let params = [
    //     { log_name: 'Watch' }
    //   ]

    //   let startDate;
    //   let endDate;

    //   if(filterBy == 'month'){
    //     startDate = new Date(moment('01-01-2024').startOf('month'))
    //     endDate = new Date(moment('01-01-2024').endOf('month'))
    //   }

    //   let activity_log = await Activity.find()
    //     .where({ $and: [
    //       { log_name: 'Watch' },
    //       { timestamp: {
    //         $lte: endDate,
    //         $gte: startDate
    //       }}
    //     ]})
    //     .select('_id user log_name description')
    //     .countDocuments()

    //   console.log('activity_log', activity_log)

    // }

    const { limit, page } = req.query;

    const limitData = limit ?? 10
    const pageData = page ?? 1

    const totalData = await User.countDocuments({})
    const totalPage = Math.ceil(totalData/ limitData)

    const users = await User.find()
      .select('_id name user_id avatar totalWatchLive watchLiveIDN watchShowroomMember')
      .sort({[sort]: -1})
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
    console.log('Error Controller Get Leaderboard : ', error.message)
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
