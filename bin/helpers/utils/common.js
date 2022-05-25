
const crypto = require('crypto');
const dateFormat = require('dateformat');
const config = require('../../infra/configs/global_config');

const getLastFromURL = async (url) => {
  let name = decodeURI(url).split('/').pop();
  name = name.replace(/(\r\n|\n|\r)/gm, '');
  return String(name);
};

const encrypt = async (text, algorithm, secretKey) => {
  const cipher = crypto.createCipher(algorithm, secretKey);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

const decrypt = async (text, algorithm, secretKey) => {
  const decipher = crypto.createDecipher(algorithm, secretKey);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

const encryptWithIV = async (text, algorithm, secretKey) => {
  const iv = crypto.randomBytes(config.get('/cipher/ivLength'));
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decryptWithIV = async (text, algorithm, secretKey) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encrypted = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  const decrypted = decipher.update(encrypted);
  return Buffer.concat([decrypted, decipher.final()]).toString();
};

const getOtp = async (digit) => {
  let dateOtp = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
  let md5 = crypto.createHash('md5');
  md5.update(dateOtp + 'trace');
  let myHash = md5.digest('hex');
  let counter = 0;
  let hashLen = myHash.length;
  let arrayData = [];
  while (counter < hashLen) {
    let currentChar = myHash.charAt(counter);
    if (/[\d]/.test(currentChar)) {
      arrayData.push(currentChar);
    }
    ++counter;
  }

  let dataCounter = arrayData.toString();
  let replaceData = dataCounter.replace(/,/gm, '');
  let reverseOtp = await reverse(replaceData.substring(0, digit));
  return reverseOtp;
};

const reverse = async(str)=> {
  let counter = str.length - 1;
  let result = '';
  while (counter >= 0) {
    result += str.charAt(counter);
    --counter;
  }
  return result;
};

module.exports = {
  getLastFromURL,
  encrypt,
  decrypt,
  encryptWithIV,
  decryptWithIV,
  getOtp,
};
