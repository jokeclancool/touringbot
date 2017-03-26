const Request = require('./request')
const Crypto = require('crypto')

/** Class representing a line bot api client. */
class LineBot {
  /**
   * create a line bot api client
   * @param {Object} credentials - input Channel Access Token and Channel Secret.
   */
  constructor(credentials) {
    this._credentials = credentials
    if (!this._credentials) {
      throw new Error("InvalidCredentialsError")
    }
  }

  _getCredential(credentialKey) {
    return this._credentials[credentialKey]
  }

  getChannelToken() {
    return this._getCredential('channelToken')
  }

  getChannelSecret() {
    return this._getCredential('channelSecret')
  }

  /**
   * Verify the request was sent from the LINE Platform.
   * @param {Buffer} content - raw body of http
   * @param {string} channelSignature - Channel Secret
   */
  validateSignature(content, channelSignature) {
    if (!channelSignature || !this.getChannelSecret()) {
      return false
    }
    const hmac = Crypto.createHmac('sha256', this.getChannelSecret())
    hmac.update(content)
    return hmac.digest('base64') === channelSignature
  }

  /**
   * Respond to events from users, groups, and rooms.
   * @param {String} replyToken
   * @param {(Object|Array)} messages
   */
  replyMessage(replyToken, messages) {
    const data = {
      "replyToken": replyToken,
      "messages": Array.isArray(messages) ? messages : [messages]
    }
    const request = new Request('/v2/bot/message/reply', this.getChannelToken(), data)
    return request.post()
  }

  /**
   * Send messages to users, groups, and rooms
   * @param {String} userId
   * @param {(Object|Array)} messages
   */
  pushMessage(userId, messages) {
    const data = {
      "to": userId,
      "messages": Array.isArray(messages) ? messages : [messages]
    }
    const request = new Request('/v2/bot/message/push', this.getChannelToken(), data)
    return request.post()
  }

  /**
   * Get user profile information.
   * @param {String} userId
   */
  getProfile(userId) {
    const path = '/v2/bot/profile/' + userId
    const request = new Request(path, this.getChannelToken())
    return request.get()
  }

  /**
   * Retrieve image, video, and audio data sent by users.
   * @param {String} messageId
   */
  getContent(messageId) {
    const path = '/v2/bot/message/' + messageId + '/content'
    const request = new Request(path, this.getChannelToken())
    return request.get()
  }

  /**
   * Leave a group or room.
   * @param {String} roomId
   */
  leaveRoom(roomId) {
    const path = '/v2/bot/room/' + roomId + '/leave'
    const request = new Request(path, this.getChannelToken())
    return request.post()
  }
}

module.exports = LineBot
