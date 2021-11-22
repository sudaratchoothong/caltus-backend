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

// router.route('/user').get((request, response) => {
//     // db.getuser().then((data) => {
//     //   response.json(data[0]);
//     // })
//     connection.query('SELECT * FROM user', function(err, results) {
//         if (err) {
//             console.log(err);
//         } else {
//             response.send(results);
//         }

//     });
//   });


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

module.exports = router;
