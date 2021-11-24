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
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
}

// register
const register = async(req, res) => {
  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password,sqltRounds),
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
        results = resultsEmail[0];  
      }
    } else {
      message = "Duplicate username";
      error = true;
      results = resultsUsername[0];
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
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
        message = "Not math password";
        error = true;
      }
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
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
      results = {id_user:resultsCreateUser.insertId, ...user}
      req.session.id_user = resultsCreateUser.insertId;
    } else {
      //เคยใช้เมล์นี้ล็อคอินมาก่อน เข้าใช้ได้เลย
      message = "Your login with Google successfully";
      error = false;
      delete resultsEmail[0].password;
      results = resultsEmail[0];
      req.session.id_user = resultsEmail[0].id_user;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
}

// เช็ค Session
const session = async(req,res) => {
  return res.send({error:false, data:req.session, message:"Your session"});
}

// Logout
const logout = async(req,res) => {
  req.session.destroy();
  return res.send({error:false, message:"Your logout successfully"})
}

// Check login
const isLogin = (req) => {
  let sess = req.session;

  if (sess.id_user === undefined || sess.id_user == 0) {
    return false;
  } else {
    return true;
  }
}

// Get me
const getMe = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;

  try {
    const results = await pool.query("SELECT id_user,first_name,last_name,email,username FROM user WHERE id_user = ?",[id_user]);
    if (results === undefined || results.length == 0 ) {
      message = "Your account could not be found in the database, Please log in again.";
      error = true;
    } else {
      message = "Get Me successfully";
      error = false;
    }
    return res.send({error:error, data:results[0], message:message});
  }
  catch (err) {
    console.log(err);
  }
}

// Update my infomation
const updateMe = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const user = {id_user:req.session.id_user, ...req.body}

  try {
    const results = await pool.query("UPDATE user SET first_name = ?,last_name = ? WHERE id_user = ?",[user.first_name,user.last_name,user.id_user]);
    if (results.affectedRows === 0) {
      message = "Profile update failed";
      error = true;
    } else {
      message = "Profile update successfully";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
}

//เปลี่ยนรหัสผ่าน (ไม่มีก็ได้)
const changePassword = async(req,res) => {
  let message = "";
  let error;
  let results;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  let user = {
    id_user: req.session.id_user,
    current_password: req.body.current_password,
    new_password: bcrypt.hashSync(req.body.new_password,sqltRounds),
  }

  try {
    const results_user = await pool.query("SELECT id_user,username,password FROM user WHERE id_user = ?",[user.id_user]);
    console.log(user.new_password);
    if (results_user === undefined || results_user.length == 0) {
      message = "Your account could not be found in the database. Please log in again.";
      error = true;
    } else {
      if (results_user[0].username == null) {
        message = "You are login with Google.";
        error = true;
      } else {
        if (bcrypt.compareSync(user.current_password,results_user[0].password)) {
          const results_changePwd = await pool.query("UPDATE user SET password = ? WHERE id_user = ?",[user.new_password,user.id_user]);
          if (results_changePwd.affectedRows === 0) {
            message = "Failed to change password.";
            error = true;
          } else {
            message = "Password change successfully"
            error = false;
          }
          results = results_changePwd;
        } else {
          message = "The current password does not match.";
          error = true;
        }

      }
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }

};

//แสดงเหรียญที่ติดตามทั้งหมด
const getMyTrackers = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;

  try {
    const results = await pool.query("SELECT * FROM tracker WHERE id_user = ?",[id_user]);
    if (results === undefined || results.length == 0) {
      message = "You don't have any tracked coins.";
      error = true;
    } else {
      message = "All your tracking coins have been successfully retrieved.";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
};

// แสดงเหรียญที่ติดตามเจาะจง
const getMyTracker = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  let id = req.params.id;

  try {
    const results = await pool.query("SELECT * FROM tracker WHERE id_user = ? AND id_tracker = ?",[id_user,id]);
    if (results === undefined || results.length == 0) {
      message = "Tracked coins not found.";
      error = true;
    } else {
      message = "Successfully retrieved tracker data";
      error = false;
    }
    return res.send({error:error, data:results[0], message:message});
  }
  catch (err) {
    console.log(err);
  }
}

//สร้างเหรียญติดตาม
const createMyTracker = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const tracker = {
    stock_name: req.body.stock_name,
    amount_stock: req.body.amount_stock,
    buy_pricel: req.body.buy_pricel,
  }

  try {
    const results = await pool.query("INSERT INTO tracker (stock_name,amount_stock,buy_pricel,id_user) VALUES (?,?,?,?)",[tracker.stock_name,tracker.amount_stock,tracker.buy_pricel,id_user]);
    message = "Tracker coin successfully added";
    error = false
    return res.send({error:error, data:{id_tracker:results.insertId}, message:message});
  }
  catch (err) {
    console.log(err); 
  }
};

//แก้ไขเหรียญติดตาม
const editMyTracker = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const tracker = {
    id_tracker: req.params.id,
    stock_name: req.body.stock_name,
    amount_stock: req.body.amount_stock,
    buy_pricel: req.body.buy_pricel,
  }

  try {
    const results = await pool.query("UPDATE tracker SET stock_name = ?,amount_stock = ?,buy_pricel= ? WHERE id_user = ? AND id_tracker = ?",[tracker.stock_name,tracker.amount_stock,tracker.buy_pricel,id_user,tracker.id_tracker]);
    if (results.changedRows === 0) {
      message = "Tracker coin not found or data are same.";
      error = true;
    } else {
      message = "Tracker coin successfully update.";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
};

//ลบเหรียญที่ติดตาม
const deleteMyTracker = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const id_tracker = req.params.id;
  try {
    const results = await pool.query("DELETE FROM tracker WHERE id_user = ? AND id_tracker = ?",[id_user,id_tracker]);
    if (results.affectedRows === 0) {
      message = "Tracker coin not found.";
      error = true;
    } else {
      message = "Tracker coin successfully delete.";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
};

//แสดงโน๊ตทั้งหมด
const getMyNotes = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;

  try {
    const results = await pool.query("SELECT * FROM note WHERE id_user = ?",[id_user]);
    if (results === undefined || results.length == 0) {
      message = "You don't have any note.";
      error = true;
    } else {
      message = "All your note have been successfully retrieved.";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
};

// แสดงโน๊ตเจาะจง
const getMyNote = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  let id = req.params.id;

  try {
    const results = await pool.query("SELECT * FROM note WHERE id_user = ? AND id_note = ?",[id_user,id]);
    if (results === undefined || results.length == 0) {
      message = "Note not found.";
      error = true;
    } else {
      message = "Successfully retrieved note data";
      error = false;
    }
    return res.send({error:error, data:results[0], message:message});
  }
  catch (err) {
    console.log(err);
  }
}

//สร้างโน๊ต
const createMyNotes = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const note = {
    note_name: req.body.note_name,
    content_note: req.body.content_note,
    image_note: req.body.image_note,
  }

  try {
    const results = await pool.query("INSERT INTO note (note_name,content_note,image_note,id_user) VALUES (?,?,?,?)",[note.note_name,note.content_note,note.image_note,id_user]);
    message = "Note successfully added";
    error = false
    return res.send({error:error, data:{id_note:results.insertId}, message:message});
  }
  catch (err) {
    console.log(err); 
  }
};

//แก้ไขโน๊ต
const editMyNotes = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const note = {
    id_note: req.params.id,
    note_name: req.body.note_name,
    content_note: req.body.content_note,
    image_note: req.body.image_note,
  }

  try {
    const results = await pool.query("UPDATE note SET note_name = ?,content_note = ?,image_note= ? WHERE id_user = ? AND id_note = ?",[note.note_name,note.content_note,note.image_note,id_user,note.id_note]);
    if (results.changedRows === 0) {
      message = "Note not found or data are same.";
      error = true;
    } else {
      message = "Note successfully update.";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
};

//ลบโน๊ต
const deleteMyNotes = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const id_note = req.params.id;
  try {
    const results = await pool.query("DELETE FROM note WHERE id_user = ? AND id_note = ?",[id_user,id_note]);
    if (results.affectedRows === 0) {
      message = "Note not found.";
      error = true;
    } else {
      message = "Note successfully delete.";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
};

// ดูลิสต์เครื่องคิดเลข
const calculatorList = async(req,res) => {
  let message = "";
  let error;
  
  try {
    const results = await pool.query("SELECT * FROM calculate_list");
    if (results === undefined || results.length == 0) {
      message = "Calculator list not found.";
      error = true;
    } else {
      message = "Successfully retrieved calculator list.";
      error = false;
    }
    return res.send({error:error, data:results, message:message});
  }
  catch (err) {
    console.log(err);
  }
}

// ประวัติการใช้เครื่องคิดเลข
const historyCalculator = async(req,res) => {
  let message = "";
  let error;
  let resultsHistory = [];
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;

  try {
    
    const results1 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_pnl a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    const results2 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_percent a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    const results3 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_fee a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    const results4 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_average a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    const results5 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_liquidation a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    const results6 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_trade a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    const results7 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_leverge a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    const results8 = await pool.query("SELECT * FROM history_calculate h INNER JOIN calculate_apy a ON h.id_history_calculate = a.id_history_calculate AND h.id_cal = a.id_cal WHERE h.id_user = ?",[id_user]);
    resultsHistory = [...resultsHistory, ...results1, ...results2, ...results3, ...results4, ...results5, ...results6, ...results7, ...results8];
    if (resultsHistory === undefined || resultsHistory.length == 0) {
      message = "History not found.";
      error = true;
    } else {
      message = "Successfully retrieved history.";
      error = false;
      resultsHistory.sort((left,right) => {
        if (left.id_history_calculate < right.id_history_calculate) {
          return -1;
        } else if (left.id_history_calculate > right.id_history_calculate) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    
    return res.send({error:error, data:resultsHistory, message:message});
  }
  catch (err) {
    console.log(err);
  }
}

// calculate_pnl
const calculatePnl = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const pnl = {
    id_cal: req.body.id_cal,
    entry_price: req.body.entry_price,
    exit_price: req.body.exit_price,
    quantity: req.body.quantity,
    buy_fee: req.body.buy_fee,
    sell_fee: req.body.sell_fee,
    result: req.body.result
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[pnl.id_cal,id_user]);
    const resultsPnl = await pool.query("INSERT INTO calculate_pnl (id_history_calculate,id_cal,entry_price,exit_price,quantity,buy_fee,sell_fee,result) VALUES (?,?,?,?,?,?,?,?)",[resultsHistory.insertId,pnl.id_cal,pnl.entry_price,pnl.exit_price,pnl.quantity,pnl.buy_fee,pnl.sell_fee,pnl.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsPnl, message:message});
  }
  catch (err) {
    console.log(err);
  }

}

// calculate_percent
const calculatePercent = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const percent = {
    id_cal: req.body.id_cal,
    amount1_1: req.body.amount1_1,
    percent1_2: req.body.percent1_2,
    input2_1: req.body.input2_1,
    input2_2: req.body.input2_2,
    price3_1: req.body.price3_1,
    price3_2: req.body.price3_2,
    result: req.body.result,
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[percent.id_cal,id_user]);
    const resultsPercent = await pool.query("INSERT INTO calculate_percent (id_history_calculate,id_cal,amount1_1,percent1_2,input2_1,input2_2,price3_1,price3_2,result) VALUES (?,?,?,?,?,?,?,?,?)",[resultsHistory.insertId,percent.id_cal,percent.amount1_1,percent.percent1_2,percent.input2_1,percent.input2_2,percent.price3_1,percent.price3_2,percent.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsPercent, message:message});
  }
  catch (err) {
    console.log(err);
  }

}

// calculate_fee
const calculateFee = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const fee = {
    id_cal: req.body.id_cal,
    trade_size: req.body.trade_size,
    fee_rate: req.body.fee_rate,
    result: req.body.result,
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[fee.id_cal,id_user]);
    const resultsFee = await pool.query("INSERT INTO calculate_fee (id_history_calculate,id_cal,trade_size,fee_rate,result) VALUES (?,?,?,?,?)",[resultsHistory.insertId,fee.id_cal,fee.trade_size,fee.fee_rate,fee.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsFee, message:message});
  }
  catch (err) {
    console.log(err);
  }

}

// calculate_average
const calculateAverage = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const average = {
    id_cal: req.body.id_cal,
    quantity1: req.body.quantity1,
    quantity2: req.body.quantity2,
    quantity3: req.body.quantity3,
    quantity4: req.body.quantity4,
    quantity5: req.body.quantity5,
    price1: req.body.price1,
    price2: req.body.price2,
    price3: req.body.price3,
    price4: req.body.price4,
    price5: req.body.price5,
    result: req.body.result,
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[average.id_cal,id_user]);
    const resultsAverage = await pool.query("INSERT INTO calculate_average (id_history_calculate,id_cal,quantity1,quantity2,quantity3,quantity4,quantity5,price1,price2,price3,price4,price5,result) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",[resultsHistory.insertId,average.id_cal,average.quantity1,average.quantity2,average.quantity3,average.quantity4,average.quantity5,average.price1,average.price2,average.price3,average.price4,average.price5,average.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsAverage, message:message});
  }
  catch (err) {
    console.log(err);
  }

}

// calculate_liquidation
const calculateLiquidation = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const liquidation = {
    id_cal: req.body.id_cal,
    entry_price: req.body.entry_price,
    quantity: req.body.quantity,
    balance: req.body.balance,
    result: req.body.result,
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[liquidation.id_cal,id_user]);
    const resultsLiquidation = await pool.query("INSERT INTO calculate_liquidation (id_history_calculate,id_cal,entry_price,quantity,balance,result) VALUES (?,?,?,?,?,?)",[resultsHistory.insertId,liquidation.id_cal,liquidation.entry_price,liquidation.quantity,liquidation.balance,liquidation.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsLiquidation, message:message});
  }
  catch (err) {
    console.log(err);
  }

}

// calculate_trade
const calculateTrade = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const trade = {
    id_cal: req.body.id_cal,
    amount: req.body.amount,
    leverage: req.body.leverage,
    rate_trade: req.body.rate_trade,
    number_trade: req.body.number_trade,
    result: req.body.result,
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[trade.id_cal,id_user]);
    const resultsTrade = await pool.query("INSERT INTO calculate_trade (id_history_calculate,id_cal,amount,leverage,rate_trade,number_trade,result) VALUES (?,?,?,?,?,?,?)",[resultsHistory.insertId,trade.id_cal,trade.amount,trade.leverage,trade.rate_trade,trade.number_trade,trade.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsTrade, message:message});
  }
  catch (err) {
    console.log(err);
  }

}

// calculate_leverge
const calculateLeverge = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const leverge = {
    id_cal: req.body.id_cal,
    leverage: req.body.leverage,
    rate: req.body.rate,
    result: req.body.result,
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[leverge.id_cal,id_user]);
    const resultsLeverge = await pool.query("INSERT INTO calculate_leverge (id_history_calculate,id_cal,leverage,rate,result) VALUES (?,?,?,?,?)",[resultsHistory.insertId,leverge.id_cal,leverge.leverage,leverge.rate,leverge.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsLeverge, message:message});
  }
  catch (err) {
    console.log(err);
  }

}

// calculate_apy
const calculateApy = async(req,res) => {
  let message = "";
  let error;
  if (isLogin(req) == false) {
    message = "Login again";
    error = true;
    return res.send({error:error, message:message})
  }
  const id_user = req.session.id_user;
  const apy = {
    id_cal: req.body.id_cal,
    principal_amount: req.body.principal_amount,
    apy: req.body.apy,
    day: req.body.day,
    result: req.body.result,
  }

  try {
    const resultsHistory = await pool.query("INSERT INTO history_calculate (id_cal,id_user) VALUES (?,?)",[apy.id_cal,id_user]);
    const resultsApy = await pool.query("INSERT INTO calculate_apy (id_history_calculate,id_cal,principal_amount,apy,day,result) VALUES (?,?,?,?,?,?)",[resultsHistory.insertId,apy.id_cal,apy.principal_amount,apy.apy,apy.day,apy.result]);
    message = "History successfully added";
    error = false;

    return res.send({error:error, data:resultsApy, message:message});
  }
  catch (err) {
    console.log(err);
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
  changePassword,
  getMyTrackers,
  getMyTracker,
  createMyTracker,
  editMyTracker,
  deleteMyTracker,
  getMyNotes,
  getMyNote,
  createMyNotes,
  editMyNotes,
  deleteMyNotes,
  calculatorList,
  historyCalculator,
  calculatePnl,
  calculatePercent,
  calculateFee,
  calculateAverage,
  calculateLiquidation,
  calculateTrade,
  calculateLeverge,
  calculateApy,
};