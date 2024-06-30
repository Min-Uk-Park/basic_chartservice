const express = require('express');
const mysql = require('mysql');
const path = require('path');
const static = require('serve-static');
const dbconfig = require('./config/database.js');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false,
  timezone: 'KST', // 한국 시간 적용
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', static(path.join(__dirname, 'public')));

app.listen(3000, () => {
  console.log('Server Start');
});
