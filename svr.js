const express = require('express');
const mysql = require('mysql');
const path = require('path');
const static = require('serve-static');
const dbconfig = require('./config/dbconfig.json');

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

// /chartdatafromdb
app.post('/chartdatafromdb', (req, res) => {
  console.log('chartdatafromdb 호출됨');

  pool.getConnection((err, conn) => {
    const resData = {};
    resData.result = 'error';
    resData.temp = [];
    resData.reg_date = [];

    if (err) {
      conn.release(); // 반드시 해제
      console.log('데이터베이스 연결 객체를 얻지 못함.');
      res.json(resData);
      return;
    }

    // DB에 data를 요청한다.
    const exec = conn.query(
      'select `temperature`, `reg_date` from `building_temperature` order by reg_date asc',
      (err, rows) => {
        if (err) {
          conn.release(); // 반드시 해제
          console.log('데이터 조회 실패.');
          res.json(resData);
          return;
        }

        // 조회가 된다면,
        if (rows.length > 0) {
          resData.result = 'ok';
          rows.forEach((element) => {
            resData.temp.push(element.temperature);
            resData.reg_date.push(element.reg_date);
          });
        }
        // query는 성공했지만, 조회된 데이터가 없다면,
        else {
          resData.result = 'none';
        }
        console.log('resData: ', resData);
        return res.json(resData);
      }
    );
  });
});

// /chartdatafromdbwithbid
app.post('/chartdatafromdbwithbid', (req, res) => {
  console.log('chartdatafromdbwithbid 호출됨');

  const bid = req.body.bid;
  console.log('bid is %s', bid);

  pool.getConnection((err, conn) => {
    const resData = {};
    resData.result = 'error';
    resData.temp = [];
    resData.reg_date = [];

    if (err) {
      conn.release(); // 반드시 해제
      console.log('데이터베이스 연결 객체를 얻지 못함.');
      res.json(resData);
      return;
    }

    // DB에 data를 요청한다.
    const exec = conn.query(
      'select `temperature`, `reg_date` from `building_temperature` where `building_id` = ? order by reg_date asc',
      [bid],
      (err, rows) => {
        if (err) {
          conn.release(); // 반드시 해제
          console.log('데이터 조회 실패.');
          res.json(resData);
          return;
        }

        // 조회가 된다면,
        if (rows.length > 0) {
          resData.result = 'ok';
          rows.forEach((element) => {
            resData.temp.push(element.temperature);
            resData.reg_date.push(element.reg_date);
          });
        }
        // query는 성공했지만, 조회된 데이터가 없다면,
        else {
          resData.result = 'none';
        }
        console.log('resData: ', resData);
        return res.json(resData);
      }
    );
  });
});
app.listen(3000, () => {
  console.log('Server Start');
});
