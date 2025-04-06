Object.defineProperty(exports, '__esModule', { value: true })
exports.isBase64 = void 0
exports.errorCode = errorCode
exports.isAbortedError = isAbortedError
exports.isConflictError = isConflictError
exports.isUnauthenticatedError = isUnauthenticatedError
exports.promisify1 = promisify1
exports.promisify3 = promisify3
exports.stringifyMessage = stringifyMessage
exports.strToB64 = strToB64
exports.strToU8 = strToU8
exports.b64ToStr = b64ToStr
exports.u8ToStr = u8ToStr
exports.strToJson = strToJson
var grpc = require('@grpc/grpc-js')
function errorCode(err) {
  if (
    err === undefined ||
    typeof err !== 'object' ||
    !Object.prototype.hasOwnProperty.call(err, 'code') ||
    typeof err.code !== 'number'
  ) {
    return {
      valid: false,
      code: -1,
    }
  }
  return {
    valid: true,
    code: err.code,
  }
}
function isAbortedError(err) {
  var ec = errorCode(err)
  return ec.valid && ec.code === grpc.status.ABORTED
}
function isConflictError(err) {
  var ec = errorCode(err)
  return (
    ec.valid &&
    (ec.code === grpc.status.ABORTED ||
      ec.code === grpc.status.FAILED_PRECONDITION)
  )
}
function isUnauthenticatedError(err) {
  var ec = errorCode(err)
  return ec.valid && ec.code === grpc.status.UNAUTHENTICATED
}
function promisify1(f, thisContext) {
  return (arg) =>
    new Promise((resolve, reject) => {
      f.call(thisContext, arg, (err, result) =>
        err !== undefined && err !== null ? reject(err) : resolve(result),
      )
    })
}
function promisify3(f, thisContext) {
  return (argA, argB, argC) =>
    new Promise((resolve, reject) => {
      f.call(thisContext, argA, argB, argC, (err, result) =>
        err !== undefined && err !== null ? reject(err) : resolve(result),
      )
    })
}
function stringifyMessage(msg) {
  return JSON.stringify(msg.toObject())
}
var is_base64_1 = require('is-base64')
Object.defineProperty(exports, 'isBase64', {
  enumerable: true,
  get: () => is_base64_1.isBase64,
})
function strToB64(str) {
  return Buffer.from(str, 'utf8').toString('base64')
}
function strToU8(str) {
  return new Uint8Array(Buffer.from(str, 'utf8'))
}
function b64ToStr(b64Str) {
  return Buffer.from(b64Str, 'base64').toString()
}
function u8ToStr(arr) {
  var buf = Buffer.from(arr.buffer)
  if (arr.byteLength !== arr.buffer.byteLength) {
    buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
  }
  return buf.toString()
}
function strToJson(jsonStr) {
  try {
    return JSON.parse(jsonStr)
  } catch (_a) {
    return {}
  }
}
