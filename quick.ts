import { RestPublicClient } from './src';

const client = new RestPublicClient({
  sandbox: true,
});

async function runQuick() {
  console.log('ran');
  console.log(await client.getTickers());
}

runQuick();
