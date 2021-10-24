var { request } = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt")
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

const getuser = (request, response) => {
  connection.query("SELECT * FROM user", function (err, results) {
    if (err) {
      console.log(err);
    } else {
      response.send(results);
    }
  });
};

const register = (request, response) => {
  const user = {
    fullName: request.body.fullName,
    email: request.body.email,
    username: request.body.username,
    password: request.body.password,
  };

  connection.query("SELECT username FROM user WHERE username = ?",[user.username], function (err, results) {
    if (err) {
      console.log(err);
    } else {
      if(results.length>0){
          response.send('Duplicate username');
      }else {
        connection.query("SELECT email FROM user WHERE email = ?",[user.email], function (err, results) {
            if (err) {
              console.log(err);
            } else {
              if(results.length>0){
                  response.send('Duplicate email');
              }else {
                connection.query("INSERT INTO user (name,email,username,password) VALUES (?,?,?,?)",[user.fullName,user.email,user.username,user.password], function (err, results) {
                    if (err) {
                      console.log(err);
                    } else {
                      response.send('Your account has been created successfully');
                    }
                  });
              }
            }
          });
      }
    }
  });
  
};

module.exports = {
  getuser,
  register,
};
