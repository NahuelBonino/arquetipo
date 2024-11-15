export * from '@testing-library/react';

const CryptoJS = require("crypto-js");

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function base64url(source) {
  // Encode in classical base64
  let encodedSource = CryptoJS.enc.Base64.stringify(source);

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}

let header = {
  "alg": "HS256",
  "typ": "JWT"
};

let stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
let encodedHeader = base64url(stringifiedHeader);

let data = {
  "id": 1337,
  "username": "john.doe"
};

let stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
let encodedData = base64url(stringifiedData);

export const fakeToken = encodedHeader + "." + encodedData;

