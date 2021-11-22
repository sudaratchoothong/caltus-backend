const util = require('util')
const mysql = require('mysql')
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'caltus'
})

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.') //ฐานข้อมููลไม่ได้เปิดใช้งาน
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.') //เช็คการเชื่อมดา้ตาเบส ที่กำหนดไว้10
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.') //เช็คว่าฐานข้อมูลปฏิเสธไหม
    }
  }

  if (connection) connection.release()

  return
})

pool.query = util.promisify(pool.query)

module.exports = pool