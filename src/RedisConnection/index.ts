/*
* @adonisjs/redis
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/redis.ts" />

import Redis from 'ioredis'
import { IocContract } from '@adonisjs/fold'
import { RedisConnectionConfig } from '@ioc:Adonis/Addons/Redis'

import { ioMethods } from '../ioMethods'
import { AbstractConnection } from '../AbstractConnection'

/**
 * Redis connection exposes the API to run Redis commands using `ioredis` as the
 * underlying client. The class abstracts the need of creating and managing
 * multiple pub/sub connections by hand, since it handles that internally
 * by itself.
 */
export class RedisConnection extends AbstractConnection<Redis.Redis> {
  constructor (
    connectionName: string,
    private config: RedisConnectionConfig,
    container: IocContract,
  ) {
    super(connectionName, container)
    this.ioConnection = new Redis(this.config)
    this.proxyConnectionEvents()
  }

  /**
   * Creates the subscriber connection, the [[AbstractConnection]] will
   * invoke this method when first subscription is created.
   */
  protected makeSubscriberConnection () {
    this.ioSubscriberConnection = new Redis(this.config)
  }
}

/**
 * Since types in AdonisJS are derived from interfaces, we take the leverage
 * of dynamically adding redis methods to the class prototype.
 */
ioMethods.forEach((method) => {
  RedisConnection.prototype[method] = function redisConnectionProxyFn (...args: any[]) {
    return this.ioConnection[method](...args)
  }
})
