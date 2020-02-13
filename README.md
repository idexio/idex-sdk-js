# Setup

```
yarn
docker-compose up -d
yarn build
yarn db:migrate
yarn test:db:migrate
```

For development, copy `.env.example` to `.env` and configure the values accordingly.

# Reset the DB

The DB's data is stored in the local `data` directory. Empty that directory to reset the DB before starting the MySQL
container again and running migrations.

# Run

```
yarn start
```

## Clearing disabled fraud proofs

The validator will turn off fraud proofs that cause code or contract errors, or that do not return expected result codes.

To re-enable all offending errors run the CLI command:

```
yarn cli clearDisabledFraudProofs
```
