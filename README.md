# XMTP Docs Bot 📄

> 💬 **Try it:** Message `docs.hi.xmtp.eth`

Go to [BotKit](https://github.com/xmtp/botkit) to learn more

## Development

To kickstart the tutorial, you'll need to clone the repository containing the bot code. Follow these steps:

```bash
git clone https://github.com/fabriguespe/ai-docs-bot.git
cd ai-docs-bot
# copy env variables template
cp .env.example .env
```

**Set the variables**

```bash
KEY= # the private key of the bot
XMTP_ENV= # set to production or dev network
KAPA_API_ENDPOINT= # kapa api endpoint
KAPA_API_TOKEN= # kapa api token
```

> ⚠️ Bot kit is not compatible with `bun` yet. Use `npm` or `yarn`

```bash
# install dependencies
yarn install

# running the bot
yarn build
yarn start

# to run with hot-reload
yarn build:watch
yarn start:watch

# run the echo example
yarn build:watch
yarn start:echo
```

## Messaging apps 💬

Test the bots in messaging apps

- [Converse](https://getconverse.app/): Own your conversations. Works with Frames (Transactions TBA)
- [Coinbase Wallet](https://www.coinbase.com/wallet): Your key to the world of crypto. (Frame support TBA)
- [dev-inbox](https://dev-dev-inbox.vercel.app/): Dev focused messaging client that renders Frames (Transactions TBA) (dev network)

## Identities

![](https://github.com/xmtp/awesome-xmtp/assets/1447073/9bb4f8c2-321e-4b6d-b52e-2105d69c4d47)

Learn about the almost 2 million identities that are already part of XMTP by visiting the [Dune dashboard](https://dune.com/xmtp_team/dash).

## Documentation 📚

To learn more about XMTP, to go the [docs](https://docs.xmtp.org/).

---

Powered by <a href="https://kapa.ai">Kapa</a>
