!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.id3js=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  if (length > 0 && length <= Buffer.poolSize)
    buf.parent = rootParent

  return buf
}

function SlowBuffer(subject, encoding, noZero) {
  if (!(this instanceof SlowBuffer))
    return new SlowBuffer(subject, encoding, noZero)

  var buf = new Buffer(subject, encoding, noZero)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0

  if (length < 0 || offset < 0 || offset > this.length)
    throw new RangeError('attempt to write outside buffer bounds');

  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length)
    newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100))
    val += this[offset + i] * mul

  return val
}

Buffer.prototype.readUIntBE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100))
    val += this[offset + --byteLength] * mul;

  return val
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100))
    val += this[offset + i] * mul
  mul *= 0x80

  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100))
    val += this[offset + --i] * mul
  mul *= 0x80

  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100))
    this[offset + i] = (value / mul) >>> 0 & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100))
    this[offset + i] = (value / mul) >>> 0 & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeIntLE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(this,
             value,
             offset,
             byteLength,
             Math.pow(2, 8 * byteLength - 1) - 1,
             -Math.pow(2, 8 * byteLength - 1))
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100))
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(this,
             value,
             offset,
             byteLength,
             Math.pow(2, 8 * byteLength - 1) - 1,
             -Math.pow(2, 8 * byteLength - 1))
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100))
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (target_start >= target.length) target_start = target.length
  if (!target_start) target_start = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || source.length === 0) return 0

  // Fatal error conditions
  if (target_start < 0)
    throw new RangeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes(string, units) {
  var codePoint, length = string.length
  var leadSurrogate = null
  units = units || Infinity
  var bytes = []
  var i = 0

  for (; i<length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {

      // last char was a lead
      if (leadSurrogate) {

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        }

        // valid surrogate pair
        else {
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      }

      // no lead yet
      else {

        // unexpected trail
        if (codePoint > 0xDBFF) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // unpaired lead
        else if (i + 1 === length) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        else {
          leadSurrogate = codePoint
          continue
        }
      }
    }

    // valid bmp char, but last char was a lead
    else if (leadSurrogate) {
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    }
    else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    }
    else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    }
    else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    }
    else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {

    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":3,"ieee754":4,"is-array":5}],3:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],4:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],5:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],6:[function(require,module,exports){
(function (Buffer){
/*
 * ID3 (v1/v2) Parser
 * 43081j
 * License: MIT, see LICENSE
 */

(function() {
	/*
	 * lib/reader.js
	 * Readers (local, ajax, file)
	 */
	var Reader = function(type) {
		this.type = type || Reader.OPEN_URI;
		this.size = null;
		this.file = null;
	};

	Reader.OPEN_FILE = 1;
	Reader.OPEN_URI = 2;
	Reader.OPEN_LOCAL = 3;

	if(typeof require === 'function') {
		var fs = require('fs');
	}

	Reader.prototype.open = function(file, callback) {
		this.file = file;
		var self = this;
		switch(this.type) {
			case Reader.OPEN_LOCAL:
				fs.stat(this.file, function(err, stat) {
					if(err) {
						return callback(err);
					}
					self.size = stat.size;
					fs.open(self.file, 'r', function(err, fd) {
						if(err) {
							return callback(err);
						}
						self.fd = fd;
						callback();
					});
				});
			break;
			case Reader.OPEN_FILE:
				this.size = this.file.size;
				callback();
			break;
			default:
				this.ajax(
					{
						uri: this.file,
						type: 'HEAD',
					},
					function(err, resp, xhr) {
						if(err) {
							return callback(err);
						}
						self.size = parseInt(xhr.getResponseHeader('Content-Length'));
						callback();
					}
				);
			break;
		}
	};

	Reader.prototype.close = function() {
		if(this.type === Reader.OPEN_LOCAL) {
			fs.close(this.fd);
		}
	};

	Reader.prototype.read = function(length, position, callback) {
		if(typeof position === 'function') {
			callback = position;
			position = 0;
		}
		if(this.type === Reader.OPEN_LOCAL) {
			this.readLocal(length, position, callback);
		} else if(this.type === Reader.OPEN_FILE) {
			this.readFile(length, position, callback);
		} else {
			this.readUri(length, position, callback);
		}
	};

	Reader.prototype.readBlob = function(length, position, type, callback) {
		if(typeof position === 'function') {
			callback = position;
			position = 0;
		} else if(typeof type === 'function') {
			callback = type;
			type = 'application/octet-stream';
		}
		this.read(length, position, function(err, data) {
			if(err) {
				callback(err);
				return;
			}
			callback(null, new Blob([data], {type: type}));
		});
	};

	/*
	 * Local reader
	 */
	Reader.prototype.readLocal = function(length, position, callback) {
		var buffer = new Buffer(length);
		fs.read(this.fd, buffer, 0, length, position, function(err, bytesRead, buffer) {
			if(err) {
				return callback(err);
			}
			var ab = new ArrayBuffer(buffer.length),
				view = new Uint8Array(ab);
			for(var i = 0; i < buffer.length; i++) {
				view[i] = buffer[i];
			}
			callback(null, ab);
		});
	};

	/*
	 * URL reader
	 */
	Reader.prototype.ajax = function(opts, callback) {
		var options = {
			type: 'GET',
			uri: null,
			responseType: 'text'
		};
		if(typeof opts === 'string') {
			opts = {uri: opts};
		}
		for(var k in opts) {
			options[k] = opts[k];
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState !== 4) return;
			if(xhr.status !== 200 && xhr.status !== 206) {
				return callback('Received non-200/206 response (' + xhr.status + ')');
			}
			callback(null, xhr.response, xhr);
		};
		xhr.responseType = options.responseType;
		xhr.open(options.type, options.uri, true);
		if(options.range) {
			options.range = [].concat(options.range);
			if(options.range.length === 2) {
				xhr.setRequestHeader('Range', 'bytes=' + options.range[0] + '-' + options.range[1]);
			} else {
				xhr.setRequestHeader('Range', 'bytes=' + options.range[0]);
			}
		}
		xhr.send();
	};

	Reader.prototype.readUri = function(length, position, callback) {
		this.ajax(
			{
				uri: this.file,
				type: 'GET',
				responseType: 'arraybuffer',
				range: [position, position+length-1]
			},
			function(err, buffer) {
				if(err) {
					return callback(err);
				}
				return callback(null, buffer);
			}
		);
	};

	/*
	 * File API reader
	 */
	Reader.prototype.readFile = function(length, position, callback) {
		var slice = this.file.slice(position, position+length),
			fr = new FileReader();
		fr.onload = function(e) {
			callback(null, e.target.result);
		};
		fr.onerror = function(e) {
			callback('File read failed');
		};
		fr.readAsArrayBuffer(slice);
	};

	/*
	 * lib/dataview-extra.js
	 */
	DataView.prototype.getString = function(length, offset, raw) {
		offset = offset || 0;
		length = length || (this.byteLength - offset);
		if(length < 0) {
			length += this.byteLength;
		}
		var str = '';
		if(typeof Buffer !== 'undefined') {
			var data = [];
			for(var i = offset; i < (offset + length); i++) {
				data.push(this.getUint8(i));
			}
			return (new Buffer(data)).toString();
		} else {
			for(var i = offset; i < (offset + length); i++) {
				str += String.fromCharCode(this.getUint8(i));
			}
			if(raw) {
				return str;
			}
			return decodeURIComponent(encodeURIComponent(str));
		}
	};

	DataView.prototype.getStringUtf16 = function(length, offset, bom) {
		offset = offset || 0;
		length = length || (this.byteLength - offset);
		var littleEndian = false,
			str = '',
			useBuffer = false;
		if(typeof Buffer !== 'undefined') {
			str = [];
			useBuffer = true;
		}
		if(length < 0) {
			length += this.byteLength;
		}
		if(bom) {
      if(offset + 1 > this.byteLength) {
        return "";
      }
			var bomInt = this.getUint16(offset);
			if(bomInt === 0xFFFE) {
				littleEndian = true;
			}
			offset += 2;
			length -= 2;
		}
		for(var i = offset; i < (offset + length); i += 2) {
			var ch = this.getUint16(i, littleEndian);
			if((ch >= 0 && ch <= 0xD7FF) || (ch >= 0xE000 && ch <= 0xFFFF)) {
				if(useBuffer) {
					str.push(ch);
				} else {
					str += String.fromCharCode(ch);
				}
			} else if(ch >= 0x10000 && ch <= 0x10FFFF) {
				ch -= 0x10000;
				if(useBuffer) {
					str.push(((0xFFC00 & ch) >> 10) + 0xD800);
					str.push((0x3FF & ch) + 0xDC00);
				} else {
					str += String.fromCharCode(((0xFFC00 & ch) >> 10) + 0xD800) + String.fromCharCode((0x3FF & ch) + 0xDC00);
				}
			}
		}
		if(useBuffer) {
			return (new Buffer(str)).toString();
		} else {
			return decodeURIComponent(encodeURIComponent(str));
		}
	};

	DataView.prototype.getSynch = function(num) {
		var out = 0,
			mask = 0x7f000000;
		while(mask) {
			out >>= 1;
			out |= num & mask;
			mask >>= 8;
		}
		return out;
	};

	DataView.prototype.getUint8Synch = function(offset) {
		return this.getSynch(this.getUint8(offset));
	};

	DataView.prototype.getUint32Synch = function(offset) {
		return this.getSynch(this.getUint32(offset));
	};

	/*
	 * Not really an int as such, but named for consistency
	 */
	DataView.prototype.getUint24 = function(offset, littleEndian) {
		if(littleEndian) {
			return this.getUint8(offset) + (this.getUint8(offset + 1) << 8) + (this.getUint8(offset + 2) << 16);
		}
		return this.getUint8(offset + 2) + (this.getUint8(offset + 1) << 8) + (this.getUint8(offset) << 16);
	};

	var id3 = function(opts, cb) {
		/*
		 * Initialise ID3
		 */
		var options = {
			type: id3.OPEN_URI,
		};
		if(typeof opts === 'string') {
			opts = {file: opts, type: id3.OPEN_URI};
		} else if((typeof window !== 'undefined' && window.File && opts instanceof window.File) || (typeof window == 'undefined' && File && opts instanceof File)) {
			opts = {file: opts, type: id3.OPEN_FILE};
		}
		for(var k in opts) {
			options[k] = opts[k];
		}

		if(!options.file) {
			return cb('No file was set');
		}

		if(options.type === id3.OPEN_FILE) {
			if (
          (typeof window === 'undefined' && !File)
          || (typeof window !== 'undefined' && !window.File) ||
          (typeof window !== 'undefined' && !window.FileReader)
          || typeof ArrayBuffer === 'undefined'
        ) {
				return cb('Browser does not have support for the File API and/or ArrayBuffers');
			}
		} else if(options.type === id3.OPEN_LOCAL) {
			if(typeof require !== 'function') {
				return cb('Local paths may not be read within a browser');
			}
		} else {
		}

		/*
		 * lib/genres.js
		 * Genre list
		 */

		var Genres = [
			'Blues',
			'Classic Rock',
			'Country',
			'Dance',
			'Disco',
			'Funk',
			'Grunge',
			'Hip-Hop',
			'Jazz',
			'Metal',
			'New Age',
			'Oldies',
			'Other',
			'Pop',
			'R&B',
			'Rap',
			'Reggae',
			'Rock',
			'Techno',
			'Industrial',
			'Alternative',
			'Ska',
			'Death Metal',
			'Pranks',
			'Soundtrack',
			'Euro-Techno',
			'Ambient',
			'Trip-Hop',
			'Vocal',
			'Jazz+Funk',
			'Fusion',
			'Trance',
			'Classical',
			'Instrumental',
			'Acid',
			'House',
			'Game',
			'Sound Clip',
			'Gospel',
			'Noise',
			'AlternRock',
			'Bass',
			'Soul',
			'Punk',
			'Space',
			'Meditative',
			'Instrumental Pop',
			'Instrumental Rock',
			'Ethnic',
			'Gothic',
			'Darkwave',
			'Techno-Industrial',
			'Electronic',
			'Pop-Folk',
			'Eurodance',
			'Dream',
			'Southern Rock',
			'Comedy',
			'Cult',
			'Gangsta Rap',
			'Top 40',
			'Christian Rap',
			'Pop / Funk',
			'Jungle',
			'Native American',
			'Cabaret',
			'New Wave',
			'Psychedelic',
			'Rave',
			'Showtunes',
			'Trailer',
			'Lo-Fi',
			'Tribal',
			'Acid Punk',
			'Acid Jazz',
			'Polka',
			'Retro',
			'Musical',
			'Rock & Roll',
			'Hard Rock',
			'Folk',
			'Folk-Rock',
			'National Folk',
			'Swing',
			'Fast  Fusion',
			'Bebob',
			'Latin',
			'Revival',
			'Celtic',
			'Bluegrass',
			'Avantgarde',
			'Gothic Rock',
			'Progressive Rock',
			'Psychedelic Rock',
			'Symphonic Rock',
			'Slow Rock',
			'Big Band',
			'Chorus',
			'Easy Listening',
			'Acoustic',
			'Humour',
			'Speech',
			'Chanson',
			'Opera',
			'Chamber Music',
			'Sonata',
			'Symphony',
			'Booty Bass',
			'Primus',
			'Porn Groove',
			'Satire',
			'Slow Jam',
			'Club',
			'Tango',
			'Samba',
			'Folklore',
			'Ballad',
			'Power Ballad',
			'Rhythmic Soul',
			'Freestyle',
			'Duet',
			'Punk Rock',
			'Drum Solo',
			'A Cappella',
			'Euro-House',
			'Dance Hall',
			'Goa',
			'Drum & Bass',
			'Club-House',
			'Hardcore',
			'Terror',
			'Indie',
			'BritPop',
			'Negerpunk',
			'Polsk Punk',
			'Beat',
			'Christian Gangsta Rap',
			'Heavy Metal',
			'Black Metal',
			'Crossover',
			'Contemporary Christian',
			'Christian Rock',
			'Merengue',
			'Salsa',
			'Thrash Metal',
			'Anime',
			'JPop',
			'Synthpop',
			'Rock/Pop'
		];


		/*
		 * lib/id3frame.js
		 * ID3Frame
		 */

		var ID3Frame = {};

		/*
		 * ID3v2.3 and later frame types
		 */
		ID3Frame.types = {
			/*
			 * Textual frames
			 */
			'TALB': 'album',
			'TBPM': 'bpm',
			'TCOM': 'composer',
			'TCON': 'genre',
			'TCOP': 'copyright',
			'TDEN': 'encoding-time',
			'TDLY': 'playlist-delay',
			'TDOR': 'original-release-time',
			'TDRC': 'recording-time',
			'TDRL': 'release-time',
			'TDTG': 'tagging-time',
			'TENC': 'encoder',
			'TEXT': 'writer',
			'TFLT': 'file-type',
			'TIPL': 'involved-people',
			'TIT1': 'content-group',
			'TIT2': 'title',
			'TIT3': 'subtitle',
			'TKEY': 'initial-key',
			'TLAN': 'language',
			'TLEN': 'length',
			'TMCL': 'credits',
			'TMED': 'media-type',
			'TMOO': 'mood',
			'TOAL': 'original-album',
			'TOFN': 'original-filename',
			'TOLY': 'original-writer',
			'TOPE': 'original-artist',
			'TOWN': 'owner',
			'TPE1': 'artist',
			'TPE2': 'band',
			'TPE3': 'conductor',
			'TPE4': 'remixer',
			'TPOS': 'set-part',
			'TPRO': 'produced-notice',
			'TPUB': 'publisher',
			'TRCK': 'track',
			'TRSN': 'radio-name',
			'TRSO': 'radio-owner',
			'TSOA': 'album-sort',
			'TSOP': 'performer-sort',
			'TSOT': 'title-sort',
			'TSRC': 'isrc',
			'TSSE': 'encoder-settings',
			'TSST': 'set-subtitle',
			/*
			 * Textual frames (<=2.2)
			 */
			'TAL': 'album',
			'TBP': 'bpm',
			'TCM': 'composer',
			'TCO': 'genre',
			'TCR': 'copyright',
			'TDY': 'playlist-delay',
			'TEN': 'encoder',
			'TFT': 'file-type',
			'TKE': 'initial-key',
			'TLA': 'language',
			'TLE': 'length',
			'TMT': 'media-type',
			'TOA': 'original-artist',
			'TOF': 'original-filename',
			'TOL': 'original-writer',
			'TOT': 'original-album',
			'TP1': 'artist',
			'TP2': 'band',
			'TP3': 'conductor',
			'TP4': 'remixer',
			'TPA': 'set-part',
			'TPB': 'publisher',
			'TRC': 'isrc',
			'TRK': 'track',
			'TSS': 'encoder-settings',
			'TT1': 'content-group',
			'TT2': 'title',
			'TT3': 'subtitle',
			'TXT': 'writer',
			/*
			 * URL frames
			 */
			'WCOM': 'url-commercial',
			'WCOP': 'url-legal',
			'WOAF': 'url-file',
			'WOAR': 'url-artist',
			'WOAS': 'url-source',
			'WORS': 'url-radio',
			'WPAY': 'url-payment',
			'WPUB': 'url-publisher',
			/*
			 * URL frames (<=2.2)
			 */
			'WAF': 'url-file',
			'WAR': 'url-artist',
			'WAS': 'url-source',
			'WCM': 'url-commercial',
			'WCP': 'url-copyright',
			'WPB': 'url-publisher',
			/*
			 * Comment frame
			 */
			'COMM': 'comments',
			/*
			 * Image frame
			 */
			'APIC': 'image',
			'PIC': 'image'
		};

		/*
		 * ID3 image types
		 */
		ID3Frame.imageTypes = [
			'other',
			'file-icon',
			'icon',
			'cover-front',
			'cover-back',
			'leaflet',
			'media',
			'artist-lead',
			'artist',
			'conductor',
			'band',
			'composer',
			'writer',
			'location',
			'during-recording',
			'during-performance',
			'screen',
			'fish',
			'illustration',
			'logo-band',
			'logo-publisher'
		];

		/*
		 * ID3v2.3 and later
		 */
		ID3Frame.parse = function(buffer, major, minor) {
			minor = minor || 0;
			major = major || 4;
			var result = {tag: null, value: null},
				dv = new DataView(buffer);
			if(major < 3) {
				return ID3Frame.parseLegacy(buffer);
			}
			var header = {
				id: dv.getString(4),
				type: dv.getString(1),
				size: dv.getUint32Synch(4),
				flags: [
					dv.getUint8(8),
					dv.getUint8(9)
				]
			};
			/*
			 * No support for compressed, unsychronised, etc frames
			 */
			if(header.flags[1] !== 0) {
				return false;
			}
			if(!header.id in ID3Frame.types) {
				return false;
			}
			result.tag = ID3Frame.types[header.id];
			if(header.type === 'T') {
				var encoding = dv.getUint8(10);
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				if(encoding === 0 || encoding === 3) {
					result.value = dv.getString(-11, 11);
				} else if(encoding === 1) {
					result.value = dv.getStringUtf16(-11, 11, true);
				} else if(encoding === 2) {
					result.value = dv.getStringUtf16(-11, 11);
				} else {
					return false;
				}
				if(header.id === 'TCON' && !!parseInt(result.value)) {
					result.value = Genres[parseInt(result.value)];
				}
			} else if(header.type === 'W') {
				result.value = dv.getString(-10, 10);
			} else if(header.id === 'COMM') {
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				var encoding = dv.getUint8(10),
					variableStart = 14, variableLength = 0;
				/*
				 * Skip the comment description and retrieve only the comment its self
				 */
				for(var i = variableStart;; i++) {
					if(encoding === 1 || encoding === 2) {
						if(dv.getUint16(i) === 0x0000) {
							variableStart = i + 2;
							break;
						}
						i++;
					} else {
						if(dv.getUint8(i) === 0x00) {
							variableStart = i + 1;
							break;
						}
					}
				}
				if(encoding === 0 || encoding === 3) {
					result.value = dv.getString(-1 * variableStart, variableStart);
				} else if(encoding === 1) {
					result.value = dv.getStringUtf16(-1 * variableStart, variableStart, true);
				} else if(encoding === 2) {
					result.value = dv.getStringUtf16(-1 * variableStart, variableStart);
				} else {
					return false;
				}
			} else if(header.id === 'APIC') {
				var encoding = dv.getUint8(10),
					image = {
						type: null,
						mime: null,
						description: null,
						data: null
					};
				var variableStart = 11, variableLength = 0;
				for(var i = variableStart;;i++) {
					if(dv.getUint8(i) === 0x00) {
						variableLength = i - variableStart;
						break;
					}
				}
				image.mime = dv.getString(variableLength, variableStart);
				image.type = ID3Frame.imageTypes[dv.getUint8(variableStart + variableLength + 1)] || 'other';
				variableStart += variableLength + 2;
				variableLength = 0;
				for(var i = variableStart;; i++) {
					if(dv.getUint8(i) === 0x00) {
						variableLength = i - variableStart;
						break;
					}
				}
				image.description = (variableLength === 0 ? null : dv.getString(variableLength, variableStart));
				image.data = buffer.slice(variableStart + 1);
				result.value = image;
			}
			return (result.tag ? result : false);
		};

		/*
		 * ID3v2.2 and earlier
		 */
		ID3Frame.parseLegacy = function(buffer) {
			var result = {tag: null, value: null},
				dv = new DataView(buffer),
				header = {
					id: dv.getString(3),
					type: dv.getString(1),
					size: dv.getUint24(3)
				};
			if(!header.id in ID3Frame.types) {
				return false;
			}
			result.tag = ID3Frame.types[header.id];
			if(header.type === 'T') {
				var encoding = dv.getUint8(7);
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				result.value = dv.getString(-7, 7);
				if(header.id === 'TCO' && !!parseInt(result.value)) {
					result.value = Genres[parseInt(result.value)];
				}
			} else if(header.type === 'W') {
				result.value = dv.getString(-7, 7);
			} else if(header.id === 'COM') {
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				var encoding = dv.getUint8(6);
				result.value = dv.getString(-10, 10);
				if(result.value.indexOf('\x00') !== -1) {
					result.value = result.value.substr(result.value.indexOf('\x00') + 1);
				}
			} else if(header.id === 'PIC') {
				var encoding = dv.getUint8(6),
					image = {
						type: null,
						mime: 'image/' + dv.getString(3, 7).toLowerCase(),
						description: null,
						data: null
					};
				image.type = ID3Frame.imageTypes[dv.getUint8(11)] || 'other';
				var variableStart = 11, variableLength = 0;
				for(var i = variableStart;; i++) {
					if(dv.getUint8(i) === 0x00) {
						variableLength = i - variableStart;
						break;
					}
				}
				image.description = (variableLength === 0 ? null : dv.getString(variableLength, variableStart));
				image.data = buffer.slice(variableStart + 1);
				result.value = image;
			}
			return (result.tag ? result : false);
		};

		/*
		 * lib/id3tag.js
		 * Parse an ID3 tag
		 */

		var ID3Tag = {};

		ID3Tag.parse = function(handle, callback) {
			var tags = {
					title: null,
					album: null,
					artist: null,
					year: null,
					v1: {
							title: null,
							artist: null,
							album: null,
							year: null,
							comment: null,
							track: null,
							version: 1.0
						},
					v2: {
							version: [null, null]
						}
				},
				processed = {
					v1: false,
					v2: false
				},
				process = function(err) {
					if(processed.v1 && processed.v2) {
						tags.title = tags.v2.title || tags.v1.title;
						tags.album = tags.v2.album || tags.v1.album;
						tags.artist = tags.v2.artist || tags.v1.artist;
						tags.year = tags.v1.year;
						callback(err, tags);
					}
				};
			/*
			 * Read the last 128 bytes (ID3v1)
			 */
			handle.read(128, handle.size - 128, function(err, buffer) {
				if(err) {
					return process('Could not read file');
				}
				var dv = new DataView(buffer);
				if(buffer.byteLength !== 128 || dv.getString(3, null, true) !== 'TAG') {
					processed.v1 = true;
					return process();
				}
				tags.v1.title = dv.getString(30, 3).replace(/(^\s+|\s+$)/, '') || null;
				tags.v1.artist = dv.getString(30, 33).replace(/(^\s+|\s+$)/, '') || null;
				tags.v1.album = dv.getString(30, 63).replace(/(^\s+|\s+$)/, '') || null;
				tags.v1.year = dv.getString(4, 93).replace(/(^\s+|\s+$)/, '') || null;
				/*
				 * If there is a zero byte at [125], the comment is 28 bytes and the remaining 2 are [0, trackno]
				 */
				if(dv.getUint8(125) === 0) {
					tags.v1.comment = dv.getString(28, 97).replace(/(^\s+|\s+$)/, '');
					tags.v1.version = 1.1;
					tags.v1.track = dv.getUint8(126);
				} else {
					tags.v1.comment = dv.getString(30, 97).replace(/(^\s+|\s+$)/, '');
				}
				/*
				 * Lookup the genre index in the predefined genres array
				 */
				tags.v1.genre = Genres[dv.getUint8(127)] || null;
				processed.v1 = true;
				process();
			});
			/*
			 * Read 14 bytes (10 for ID3v2 header, 4 for possible extended header size)
			 * Assuming the ID3v2 tag is prepended
			 */
			handle.read(14, 0, function(err, buffer) {
				if(err) {
					return process('Could not read file');
				}
				var dv = new DataView(buffer),
					headerSize = 10,
					tagSize = 0,
					tagFlags;
				/*
				 * Be sure that the buffer is at least the size of an id3v2 header
				 * Assume incompatibility if a major version of > 4 is used
				 */
				if(buffer.byteLength !== 14 || dv.getString(3, null, true) !== 'ID3' || dv.getUint8(3) > 4) {
					processed.v2 = true;
					return process();
				}
				tags.v2.version = [
					dv.getUint8(3),
					dv.getUint8(4)
				];
				tagFlags = dv.getUint8(5);
				/*
				 * Do not support unsynchronisation
				 */
				if((tagFlags & 0x80) !== 0) {
					processed.v2 = true;
					return process();
				}
				/*
				 * Increment the header size to offset by if an extended header exists
				 */
				if((tagFlags & 0x40) !== 0) {
					headerSize += dv.getUint32Synch(11);
				}
				/*
				 * Calculate the tag size to be read
				 */
				tagSize += dv.getUint32Synch(6);
				handle.read(tagSize, headerSize, function(err, buffer) {
					if(err) {
						processed.v2 = true;
						return process();
					}
					var dv = new DataView(buffer),
						position = 0;
					while(position < buffer.byteLength) {
						var frame,
							slice,
							frameBit,
							isFrame = true;
						for(var i = 0; i < 3; i++) {
							frameBit = dv.getUint8(position + i);
							if((frameBit < 0x41 || frameBit > 0x5A) && (frameBit < 0x30 || frameBit > 0x39)) {
								isFrame = false;
							}
						}
						if(!isFrame) break;
						/*
						 * < v2.3, frame ID is 3 chars, size is 3 bytes making a total size of 6 bytes
						 * >= v2.3, frame ID is 4 chars, size is 4 bytes, flags are 2 bytes, total 10 bytes
						 */
						if(tags.v2.version[0] < 3) {
							slice = buffer.slice(position, position + 6 + dv.getUint24(position + 3));
						} else {
							slice = buffer.slice(position, position + 10 + dv.getUint32Synch(position + 4));
						}
						frame = ID3Frame.parse(slice, tags.v2.version[0]);
						if(frame) {
							tags.v2[frame.tag] = frame.value;
						}
						position += slice.byteLength;
					}
					processed.v2 = true;
					process();
				});
			});
		};

		/*
		 * Read the file
		 */

		var handle = new Reader(options.type);

		handle.open(options.file, function(err) {
			if(err) {
				return cb('Could not open specified file');
			}
			ID3Tag.parse(handle, function(err, tags) {
				cb(err, tags);
				handle.close()
			});
		});
	};

	id3.OPEN_FILE = Reader.OPEN_FILE;
	id3.OPEN_URI = Reader.OPEN_URI;
	id3.OPEN_LOCAL = Reader.OPEN_LOCAL;

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = id3;
	} else {
		if(typeof define === 'function' && define.amd) {
			define('id3', [], function() {
				return id3;
			});
		} else {
			window.id3 = id3;
		}
	}
})();

}).call(this,require("buffer").Buffer)
},{"buffer":2,"fs":1}]},{},[6])(6)
});
