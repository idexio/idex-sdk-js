import type {
  MessageEventType,
  SubscriptionNamePublic,
  SubscriptionNameAuthenticated,
} from '#types/enums/index';

/**
 * - `subscription` Websocket messages always include a {@link MessageEventType type} property
 *   which dictates the shape of its `data` property.
 *   - `type` will be the name of the subscription that the message correlates to.
 * - {@link MessageEventType.subscriptions subscriptions} type messages will instead have a
 *   `subscriptions` property when dispatched.
 * - **Tip:** Using the enum {@link MessageEventType} will make it easier to narrow the messages.
 *
 * <div>
 * [[include:websocket-response-example.md]]
 * </div>
 *
 * @privateRemarks
 * <div>
 *  The divs are a hack to get code highlighting to work in ts doc while not showing the include in the IDE
 *  since the language server doesnt handle includes
 * </div>
 *
 * @see enum {@link MessageEventType}
 * @category Base Types
 */
export interface KumaEventBase {
  /**
   * The type property is used to determine the shape of the data property of the update event.
   *
   * - Subscription update events will match {@link KumaSubscriptionEventBase} with the subscription
   *   name as the value for the {@link KumaSubscriptionEventBase.type type} property.
   * - Otherwise the {@link MessageEventType type} will be:
   *   - {@link MessageEventType.subscriptions subscriptions} if you requested a list of all current subscriptions
   *   - {@link MessageEventType.error error} if your request resulted in a server error
   *
   * @see enum {@link MessageEventType}
   */
  type: MessageEventType;
  /**
   * If the request provided a `cid` parameter, the response will include the `cid` provided.
   */
  cid?: string;
  /**
   * The data object will change based on the {@link type} of the message.
   */
  data?: object;
  /**
   * A list of all active subscriptions if the `type` is {@link MessageEventType.subscriptions subscriptions}
   */
  subscriptions?: unknown[];
}

/**
 * - `subscription` Websocket messages always include a {@link MessageEventType type} property
 *   which dictates the shape of its `data` property.
 *   - `type` will be the name of the subscription that the message correlates to.
 *   - Each `Kuma<name>Event` interface will document its provided `data` shape and properties.
 * - {@link MessageEventType.subscriptions subscriptions} type messages will instead have a
 *   `subscriptions` property when dispatched.
 * - **Tip:** Using the enum {@link MessageEventType} will make it easier to narrow the messages.
 *
 * <div>
 * [[include:websocket-response-example.md]]
 * </div>
 *
 * @privateRemarks
 * <div>
 *  The divs are a hack to get code highlighting to work in ts doc while not showing the include in the IDE
 *  since the language server doesnt handle includes
 * </div>
 *
 * @see enum {@link MessageEventType}
 * @category Base Types
 */
export interface KumaSubscriptionEventBase extends KumaEventBase {
  /**
   * @inheritDoc
   */
  type: Extract<
    KumaEventBase['type'],
    SubscriptionNamePublic | SubscriptionNameAuthenticated
  >;
  /**
   * @inheritDoc
   */
  data: object;
  subscriptions?: undefined;
  cid?: undefined;
}
