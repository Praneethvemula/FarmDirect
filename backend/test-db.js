const mysql = require('mysql2');

const passwords = ['', 'root', 'admin', 'password', '123456', '1234', '12345678', 'system', 'root123'];
const host = '127.0.0.1';
const user = 'root';

const checkPassword = (password) => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({ host, user, password });
    connection.connect((err) => {
      if (err) {
        resolve({ password, success: false, error: err.code || err.message });
      } else {
        connection.end();
        resolve({ password, success: true });
      }
    });
  });
};

(async () => {
  console.log('Testing passwords...');
  for (let pwd of passwords) {
    const result = await checkPassword(pwd);
    if (result.success) {
      console.log('SUCCESS with password:', pwd === '' ? '(empty)' : pwd);
      return;
    } else {
      console.log('Failed with password:', pwd === '' ? '(empty)' : pwd, result.error);
    }
  }
  console.log('All common passwords failed.');
})();
