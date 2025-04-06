var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b
          })) ||
        ((d, b) => {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]
        })
      return extendStatics(d, b)
    }
    return (d, b) => {
      if (typeof b !== 'function' && b !== null)
        throw new TypeError(
          'Class extends value ' + String(b) + ' is not a constructor or null',
        )
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype =
        b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
Object.defineProperty(exports, '__esModule', { value: true })
exports.Mutation = exports.Response = exports.Payload = void 0
exports.createPayload = createPayload
exports.createResponse = createResponse
var jspb = require('google-protobuf')
var messages = require('../generated/api_pb')
var util_1 = require('./util')
var Payload = ((_super) => {
  __extends(Payload, _super)
  function Payload() {
    return (_super !== null && _super.apply(this, arguments)) || this
  }
  Payload.prototype.getData = function () {
    var jsonStr
    var value = _super.prototype.getData.call(this)
    if (value instanceof Uint8Array) {
      jsonStr = (0, util_1.u8ToStr)(value)
    } else {
      jsonStr = (0, util_1.b64ToStr)(value)
    }
    return (0, util_1.strToJson)(jsonStr)
  }
  Payload.prototype.getData_asB64 = function () {
    var value = _super.prototype.getData.call(this)
    if (value instanceof Uint8Array) {
      return jspb.Message.bytesAsB64(value)
    }
    return value
  }
  Payload.prototype.getData_asU8 = function () {
    var value = _super.prototype.getData.call(this)
    if (typeof value === 'string' || value instanceof String) {
      return jspb.Message.bytesAsU8(value.toString())
    }
    return value
  }
  Payload.prototype.setData = function (value) {
    if (value instanceof Uint8Array) {
      _super.prototype.setData.call(this, value)
      return
    }
    if (typeof value === 'string' || value instanceof String) {
      _super.prototype.setData.call(this, value.toString())
      return
    }
    var jsonStr = JSON.stringify(value)
    _super.prototype.setData.call(this, (0, util_1.strToU8)(jsonStr))
  }
  return Payload
})(messages.Payload)
exports.Payload = Payload
function createPayload(oldPayload) {
  return messages.Payload.deserializeBinaryFromReader(
    new Payload(),
    new jspb.BinaryReader(oldPayload.serializeBinary()),
  )
}
var Response = ((_super) => {
  __extends(Response, _super)
  function Response() {
    return (_super !== null && _super.apply(this, arguments)) || this
  }
  Response.prototype.getJson = function () {
    var jsonStr
    var value = _super.prototype.getJson.call(this)
    if (value instanceof Uint8Array) {
      jsonStr = (0, util_1.u8ToStr)(value)
    } else {
      jsonStr = (0, util_1.b64ToStr)(value)
    }
    return (0, util_1.strToJson)(jsonStr)
  }
  Response.prototype.getJson_asB64 = function () {
    var value = _super.prototype.getJson.call(this)
    if (value instanceof Uint8Array) {
      return jspb.Message.bytesAsB64(value)
    }
    return value
  }
  Response.prototype.getJson_asU8 = function () {
    var value = _super.prototype.getJson.call(this)
    if (typeof value === 'string' || value instanceof String) {
      return jspb.Message.bytesAsU8(value.toString())
    }
    return value
  }
  Response.prototype.setJson = function (value) {
    if (value instanceof Uint8Array) {
      _super.prototype.setJson.call(this, value)
      return
    }
    if (typeof value === 'string' || value instanceof String) {
      _super.prototype.setJson.call(this, value.toString())
      return
    }
    var jsonStr = JSON.stringify(value)
    _super.prototype.setJson.call(this, (0, util_1.strToU8)(jsonStr))
  }
  return Response
})(messages.Response)
exports.Response = Response
function createResponse(oldResponse) {
  return messages.Response.deserializeBinaryFromReader(
    new Response(),
    new jspb.BinaryReader(oldResponse.serializeBinary()),
  )
}
var Mutation = ((_super) => {
  __extends(Mutation, _super)
  function Mutation() {
    return (_super !== null && _super.apply(this, arguments)) || this
  }
  Mutation.prototype.getSetJson = function () {
    var jsonStr
    var value = _super.prototype.getSetJson.call(this)
    if (value instanceof Uint8Array) {
      jsonStr = (0, util_1.u8ToStr)(value)
    } else {
      jsonStr = (0, util_1.b64ToStr)(value)
    }
    return (0, util_1.strToJson)(jsonStr)
  }
  Mutation.prototype.getSetJson_asB64 = function () {
    var value = _super.prototype.getSetJson.call(this)
    if (value instanceof Uint8Array) {
      return jspb.Message.bytesAsB64(value)
    }
    return value
  }
  Mutation.prototype.getSetJson_asU8 = function () {
    var value = _super.prototype.getSetJson.call(this)
    if (typeof value === 'string' || value instanceof String) {
      return jspb.Message.bytesAsU8(value.toString())
    }
    return value
  }
  Mutation.prototype.setSetJson = function (value) {
    if (value instanceof Uint8Array) {
      _super.prototype.setSetJson.call(this, value)
      return
    }
    if (typeof value === 'string' || value instanceof String) {
      _super.prototype.setSetJson.call(this, value.toString())
      return
    }
    var jsonStr = JSON.stringify(value)
    _super.prototype.setSetJson.call(this, (0, util_1.strToU8)(jsonStr))
  }
  Mutation.prototype.getDeleteJson = function () {
    var jsonStr
    var value = _super.prototype.getDeleteJson.call(this)
    if (value instanceof Uint8Array) {
      jsonStr = (0, util_1.u8ToStr)(value)
    } else {
      jsonStr = (0, util_1.b64ToStr)(value)
    }
    return (0, util_1.strToJson)(jsonStr)
  }
  Mutation.prototype.getDeleteJson_asB64 = function () {
    var value = _super.prototype.getDeleteJson.call(this)
    if (value instanceof Uint8Array) {
      return jspb.Message.bytesAsB64(value)
    }
    return value
  }
  Mutation.prototype.getDeleteJson_asU8 = function () {
    var value = _super.prototype.getDeleteJson.call(this)
    if (typeof value === 'string' || value instanceof String) {
      return jspb.Message.bytesAsU8(value.toString())
    }
    return value
  }
  Mutation.prototype.setDeleteJson = function (value) {
    if (value instanceof Uint8Array) {
      _super.prototype.setDeleteJson.call(this, value)
      return
    }
    if (typeof value === 'string' || value instanceof String) {
      _super.prototype.setDeleteJson.call(this, value.toString())
      return
    }
    var jsonStr = JSON.stringify(value)
    _super.prototype.setDeleteJson.call(this, (0, util_1.strToU8)(jsonStr))
  }
  Mutation.prototype.getSetNquads = function () {
    var value = _super.prototype.getSetNquads.call(this)
    if (value instanceof Uint8Array) {
      return (0, util_1.u8ToStr)(value)
    }
    return (0, util_1.b64ToStr)(value)
  }
  Mutation.prototype.getSetNquads_asB64 = function () {
    var value = _super.prototype.getSetNquads.call(this)
    if (value instanceof Uint8Array) {
      return jspb.Message.bytesAsB64(value)
    }
    return value
  }
  Mutation.prototype.getSetNquads_asU8 = function () {
    var value = _super.prototype.getSetNquads.call(this)
    if (typeof value === 'string' || value instanceof String) {
      return jspb.Message.bytesAsU8(value.toString())
    }
    return value
  }
  Mutation.prototype.setSetNquads = function (value) {
    if (value instanceof Uint8Array) {
      _super.prototype.setSetNquads.call(this, value)
      return
    }
    if ((0, util_1.isBase64)(value)) {
      _super.prototype.setSetNquads.call(this, value)
      return
    }
    _super.prototype.setSetNquads.call(this, (0, util_1.strToB64)(value))
  }
  Mutation.prototype.getDelNquads = function () {
    var value = _super.prototype.getDelNquads.call(this)
    if (value instanceof Uint8Array) {
      return (0, util_1.u8ToStr)(value)
    }
    return (0, util_1.b64ToStr)(value)
  }
  Mutation.prototype.getDelNquads_asB64 = function () {
    var value = _super.prototype.getDelNquads.call(this)
    if (value instanceof Uint8Array) {
      return jspb.Message.bytesAsB64(value)
    }
    return value
  }
  Mutation.prototype.getDelNquads_asU8 = function () {
    var value = _super.prototype.getDelNquads.call(this)
    if (typeof value === 'string' || value instanceof String) {
      return jspb.Message.bytesAsU8(value.toString())
    }
    return value
  }
  Mutation.prototype.setDelNquads = function (value) {
    if (value instanceof Uint8Array) {
      _super.prototype.setDelNquads.call(this, value)
      return
    }
    if ((0, util_1.isBase64)(value)) {
      _super.prototype.setDelNquads.call(this, value)
      return
    }
    _super.prototype.setDelNquads.call(this, (0, util_1.strToB64)(value))
  }
  return Mutation
})(messages.Mutation)
exports.Mutation = Mutation
