import _ from 'lodash'

/**
 * @typedef ServerError
 * @prop {number} statusCode
 * @prop {string} error
 * @prop {string} message
 */

export default class RequestError extends Error {
  /**
   * @param {ServerError} serverError
   */
  constructor(serverError) {
    super(serverError.message)

    const shortError = _.lowerCase(serverError.error)
    this.error = shortError
    this.code = serverError.statusCode
    this.message = serverError.message
  }
}
