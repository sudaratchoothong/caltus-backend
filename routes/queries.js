var { application } = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt")
const pool = require('./database');

//init
const sqltRounds = 10;

// เชื่อมดาต้า
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "caltus",
// });

/* GET users listing. */
const getuser = async(req,res) => {
  let message = "";
  let error;
  try {
    const results = await pool.query("SELECT id_user,first_name,last_name,email,username FROM user");
    if (results === undefined || results.length == 0) {
      message = "User table is empty";
      error = true;
    } else {
      message = "Successfully retrieved all user";
      error = false;
    }
    res.send({error:error, data:results, message:message});
  }
  catch (error) {
    console.log(error);
  }
}

// register
const register = async(req, res) => {
  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password,10),
  };
  let message = "";
  let error;
  let results;

  try {
    const resultsUsername = await pool.query("SELECT username FROM user WHERE username = ?",[user.username]);
    if (resultsUsername === undefined || resultsUsername.length == 0) {
      const resultsEmail = await pool.query("SELECT email FROM user WHERE email = ?",[user.email]);
      if (resultsEmail === undefined || resultsEmail.length == 0) {
        const resultsCreateUser = await pool.query("INSERT INTO user (first_name,last_name,email,username,password) VALUES (?,?,?,?,?)",[user.first_name,user.last_name,user.email,user.username,user.password]);
        message = "Your account has been created successfully";
        error = false;
        results = {id_user:resultsCreateUser.insertId};
      } else {
        message = "Duplicate email";
        error = true;
        results = resultsEmail;  
      }
    } else {
      message = "Duplicate username";
      error = true;
      results = resultsUsername;
    }
    res.send({error:error, data:results, message:message});
  }
  catch (error) {
    console.log(error);
  }
};

// Login
const login = async(req,res) => {
  const user = {
    username : req.body.username,
    password : req.body.password
  }
  let message = "";
  let error;

  try {
    const results = await pool.query("SELECT * FROM user WHERE username = ?",[user.username])
      if (results === undefined ||  results.length == 0) {
        message = "not math username";
        error = true;
    } else {
      if (bcrypt.compareSync(user.password,results[0].password)) {
        message = "Login Successfully";
        error = false;
        delete results[0].password;
        req.session.id_user = results[0].id_user;
      } else {
        message = "not math password";
        error = true;
      }
    }
    res.send({error:error, data:results, message:message});
  }
  catch (error) {
    console.log(error);
  }
}

// Login with Google
const loginWithGoogle = async(req,res) => {
  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
  };
  let message = "";
  let error;
  let results;

  try {
    const resultsEmail = await pool.query("SELECT * FROM user WHERE email = ?",[user.email]);
    if (resultsEmail === undefined || resultsEmail.length == 0) {
      //ไม่เคยใช้เมล์นี้สมัคร จึงเพิ่มเมล์นี้ลงฐานข้อมูล
      const resultsCreateUser = await pool.query("INSERT INTO user (first_name,last_name,email) VALUES (?,?,?)",[user.first_name,user.last_name,user.email]);
      message = "Your login with Google successfully";
      error = false;
      results = [{id_user:resultsCreateUser.insertId, ...user}]
      req.session.id_user = resultsCreateUser.insertId;
    } else {
      //เคยใช้เมล์นี้ล็อคอินมาก่อน เข้าใช้ได้เลย
      message = "Your login with Google successfully";
      error = false;
      delete resultsEmail[0].password;
      results = resultsEmail;
      req.session.id_user = resultsEmail[0].id_user;
    }
    res.send({error:error, data:results, message:message});
  }
  catch (error) {
    console.log(error);
  }
}

// เช็ค Session
const session = async(req,res) => {
  res.send({error:false, data:req.session, message:"Your session"});
}

// Logout
const logout = async(req,res) => {
  req.session.destroy();
  res.send({error:false, message:"Your logout successfully"})
}

// Get me
const getMe = async(req,res) => {
  const id_user = req.session.id_user;
  let message = "";
  let error;

  const results = await pool.query("SELECT id_user,first_name,last_name,email,username FROM user WHERE id_user = ?",[id_user]);
  if (results === undefined || results.length == 0 ) {
    message = "Login again"
    error = true;
  } else {
    message = "Get Me successfully";
    error = false;
  }
  res.send({error:error, data:results, message:message});
}

// Update my infomation
const updateMe = async(req,res) => {
  const user = {id_user:req.session.id_user, ...req.body}
  res.send(user);
}


const calculate_list = async(req,res) => {
  const calculate_list = {
    
  }
  try {
    
  }
  catch (error) {

  }
}


module.exports = {
  getuser,
  register,
  login,
  loginWithGoogle,
  session,
  logout,
  getMe,
  updateMe,
};

