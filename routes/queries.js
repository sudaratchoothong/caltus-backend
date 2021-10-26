var { application } = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt")

// เชื่อมดาต้า
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "caltus",
});

/* GET users listing. */
// async  function  getuser() {
//     try {
//       let  pool = await  mysql.connect(config);
//       let  products = await  pool.request().query("SELECT * from user");
//       return  products.recordsets;
//     }
//     catch (error) {
//       console.log(error);
//     }
//   }


const getuser = (req, res) => {
  connection.query("SELECT * FROM user", function (err, results) {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  });
};




 //register
const register = (req, res) => {
  const user = {
    fullName: req.body.fullName,
    email: req.body.email,
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password,10),
  };

  // connection.query("SELECT username FROM user WHERE username = ?",[user.username], function (err, results) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if(results.length>0){
  //         res.send('Duplicate username');
  //     }else {
  //       connection.query("SELECT email FROM user WHERE email = ?",[user.email], function (err, results) {
  //           if (err) {
  //             console.log(err);
  //           } else {
  //             if(results.length>0){
  //                 res.send('Duplicate email');
  //             }else {
                // connection.query("INSERT INTO user (name,email,username,password) VALUES (?,?,?,?)",[user.fullName,user.email,user.username,user.password], function (err, results) {
                //     if (err) {
                //       console.log(err);
                //     } else {
                //       res.send('Your account has been created successfully');
                //     }
                //   });
  //             }
  //           }
  //         });
  //     }
  //   }
  // });

  connection.query("SELECT username,email FROM user WHERE username = ? OR email = ?",[user.username,user.email], function (err, results) {
    if (err) {
      console.log(err);
    } else {
      if(results.find(userDb => userDb.email === user.email)){
        res.send({msg:"Duplicate email"})
      }else if(results.find(userDb => userDb.username === user.username)){
        res.send({msg:"Duplicate username"})
      }else {
        connection.query("INSERT INTO user (name,email,username,password) VALUES (?,?,?,?)",[user.fullName,user.email,user.username,user.password], function (err, results) {
          if (err) {
            console.log(err);
          } else {
            res.send('Your account has been created successfully');
          }
        });
      }
    }
  });
};

const login = (req,res) => {
  const user = {
    username : req.body.username,
    password : req.body.password
  }

  connection.query("SELECT username,password FROM user WHERE username = ?",[user.username],function (err,results){
    if (err){
      console.log(err);
    }
    else{
      if(results.length>0){
        if(bcrypt.compareSync(user.password,results[0].password)){
        res.send({msg:"Login Success"})
        }else{
         res.send({msg:"not math password"})
        }
      }else{
        res.send({msg:"not math username"})
      }
    }
  })
}

module.exports = {
  getuser,
  register,
  login,
};
