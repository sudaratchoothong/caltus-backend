const { request } = require('express');
var express = require('express');
var router = express.Router();
const mysql = require("mysql");

const db = require('./queries');

/* GET users listing. */
// router.get('/user',db.getuser);

const connection = mysql.createConnection({
    host: 'localhost',
   user: 'root',
   password: '',
   database: 'caltus'
});

router.route('/user').get((request, response)=>{
    db.getuser(request,response);
});

router.route('/register').post((request,response)=>{
    db.register(request,response);
});


router.route('/login').post((request,response)=>{
    db.login(request,response);
});

router.route('/loginWithGoogle').post((request,response)=>{
    db.loginWithGoogle(request,response);
});

router.route('/session').get((request,response)=>{
    db.session(request,response);
});

router.route('/logout').get((request,response)=>{
    db.logout(request,response);
});

router.route('/me').get((request,response)=>{
    db.getMe(request,response);
});

router.route('/me/update').put((request,response)=>{
    db.updateMe(request,response);
});

router.route('/me/changePassword').put((request,response)=>{
    db.changePassword(request,response);
});

router.route('/trackers').get((request,response)=>{
    db.getMyTrackers(request,response);
});

router.route('/trackers/:id').get((request,response)=>{
    db.getMyTracker(request,response);
});

router.route('/trackers').post((request,response)=>{
    db.createMyTracker(request,response);
});

router.route('/trackers/:id').put((request,response)=>{
    db.editMyTracker(request,response);
});

router.route('/trackers/:id').delete((request,response)=>{
    db.deleteMyTracker(request,response);
});

router.route('/notes').get((request,response)=>{
    db.getMyNotes(request,response);
});

router.route('/notes/:id').get((request,response)=>{
    db.getMyNote(request,response);
});

router.route('/notes').post((request,response)=>{
    db.createMyNotes(request,response);
});

router.route('/notes/:id').put((request,response)=>{
    db.editMyNotes(request,response);
});

router.route('/notes/:id').delete((request,response)=>{
    db.deleteMyNotes(request,response);
});

router.route('/calculatorList').get((request,response)=>{
    db.calculatorList(request,response);
});

router.route('/historyCalculator').get((request,response)=>{
    db.historyCalculator(request,response);
});

router.route('/calculatePnl').post((request,response)=>{
    db.calculatePnl(request,response);
});

router.route('/calculatePercent').post((request,response)=>{
    db.calculatePercent(request,response);
});

router.route('/calculateFee').post((request,response)=>{
    db.calculateFee(request,response);
});

router.route('/calculateAverage').post((request,response)=>{
    db.calculateAverage(request,response);
});

router.route('/calculateLiquidation').post((request,response)=>{
    db.calculateLiquidation(request,response);
});

router.route('/calculateTrade').post((request,response)=>{
    db.calculateTrade(request,response);
});

router.route('/calculateLeverage').post((request,response)=>{
    db.calculateLeverge(request,response);
});

router.route('/calculateApy').post((request,response)=>{
    db.calculateApy(request,response);
});

router.route('/calculatePnl').get((request,response)=>{
    db.getCalulatePnl(request,response);
});

router.route('/calculatePercent').get((request,response)=>{
    db.getCalculatePercent(request,response);
});

router.route('/calculateFee').get((request,response)=>{
    db.getCalculateFee(request,response);
});

router.route('/calculateAverage').get((request,response)=>{
    db.getCalculateAverage(request,response);
});

router.route('/calculateLiquidation').get((request,response)=>{
    db.getCalculateLiquidation(request,response);
});

router.route('/calculateTrade').get((request,response)=>{
    db.getCalculateTrade(request,response);
});

router.route('/calculateLeverage').get((request,response)=>{
    db.getCalculateLeverge(request,response);
});

router.route('/calculateApy').get((request,response)=>{
    db.getCalculateApy(request,response);
});


// Api ใหม่ของเครื่องคิดเปอเซน
router.route('/calculatePercentOne').post((request,response)=>{
    db.calculatePercentOne(request,response);
});

router.route('/calculatePercentTwo').post((request,response)=>{
    db.calculatePercentTwo(request,response);
});

router.route('/calculatePercentThree').post((request,response)=>{
    db.calculatePercentThree(request,response);
});

router.route('/calculatePercentOne').get((request,response)=>{
    db.getCalculatePercentOne(request,response);
});

router.route('/calculatePercentTwo').get((request,response)=>{
    db.getCalculatePercentTwo(request,response);
});

router.route('/calculatePercentThree').get((request,response)=>{
    db.getCalculatePercentThree(request,response);
});


module.exports = router;
