crypto = require 'crypto'
pbkdf2 = require 'pbkdf2-sha256'
root = exports ? this

root.validatePassword = (key,string)->
  parts = string.split '$'
  iterations = parts[1]
  salt = parts[2]
  return pbkdf2(key, new Buffer(salt), iterations, 32).toString('base64') is parts[3]