/**
 * This file can be used to quickly test running the code without compiling first.  To use it, copy it and rename to "quick.ts" (which wont be committed git).
 * You may then add whatever you need and run `yarn start:path debug/quick.example.ts` to quickly execute the code.
 */
import * as idex from '#index';

async function main() {
  const pub = new idex.RestPublicClient({
    sandbox: true,
  });

  // const client = new idex.RestAuthenticatedClient({
  //   sandbox: true,
  //   apiKey: '',
  //   apiSecret: '',
  // });

  console.log(await pub.getExchange());
}

main().catch(console.error);
