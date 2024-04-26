<DIV>

```typescript
import {
  WebSocketClient,
  MessageEventType,
  SubscriptionNamePublic,
  type IDEXMessageEvent,
  type IDEXTickerEventData,
  type IDEXSubscribeType,
} from '@idexio/idex-sdk';

const client = new WebSocketClient();

function handleSubscriptions(subscriptions: IDEXSubscribeType[]) {
  // all subscribed subscriptions
  console.log('Active Subscriptions: ', subscriptions);
}

function handleTickersUpdate(message: IDEXTickerEventData) {
  // handle the updated data
  console.log('Ticker: ', message);
}

client.onMessage((message: IDEXMessageEvent) => {
  switch (message.type) {
    case MessageEventType.error:
      console.error(
        `[${message.data.code}] | Error received from WebSocketServer: ${message.data.message}`,
      );
      break;
    case MessageEventType.subscriptions:
      return handleSubscriptions(message.subscriptions);
    // narrows the type to the specific IDEX<name>Event type
    case MessageEventType.tickers:
      return handleTickersUpdate(message.data);
    default:
      break;
  }
});

async function main() {
  await client.connect();

  client.subscribePublic([
    {
      name: SubscriptionNamePublic.tickers,
      markets: ['ETH-USD'],
    },
  ]);
}

main().catch((error) => {
  console.error('Error During Startup: ', error);
});
```

</DIV>
