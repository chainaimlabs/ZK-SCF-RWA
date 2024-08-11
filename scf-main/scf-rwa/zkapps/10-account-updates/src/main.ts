import { ProofsOnlyZkApp } from './ProofsOnlyZkApp.js';
import { SecondaryZkApp } from './SecondaryZkApp.js';

import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';

// import { showTxn, saveTxn, printTxn } from 'mina-transaction-visualizer';

(async function main() {
  const proofsEnabled = false;
  const Local = await Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);
  const deployerAccount = Local.testAccounts[0];
  const deployerKey = deployerAccount.key;

  if (proofsEnabled) {
    await ProofsOnlyZkApp.compile();
    await SecondaryZkApp.compile();
  }

  // ----------------------------------------------------

  const proofsOnlySk = PrivateKey.random();
  const proofsOnlyAddr = proofsOnlySk.toPublicKey();

  const secondarySk = PrivateKey.random();
  const secondaryAddr = secondarySk.toPublicKey();

  const legend = {
    [proofsOnlyAddr.toBase58()]: 'proofsOnlyZkApp',
    [secondaryAddr.toBase58()]: 'secondaryZkApp',
    [deployerAccount.toBase58()]: 'deployer',
  };

  const proofsOnlyInstance = new ProofsOnlyZkApp(proofsOnlyAddr);
  const secondaryInstance = new SecondaryZkApp(secondaryAddr);

  // ----------------------------------------------------

  const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount, 2);
    await proofsOnlyInstance.deploy();
    await secondaryInstance.deploy();
  });

  await deployTxn.prove();
  deployTxn.sign([deployerKey, proofsOnlySk, secondarySk]);

  // await showTxn(deployTxn, 'deploy_txn', legend);

  await deployTxn.send();

  // ----------------------------------------------------

  const txn1 = await Mina.transaction(deployerAccount, async () => {
    await proofsOnlyInstance.add(Field(4));
  });

  await txn1.prove();

  // // await showTxn(txn1, 'txn1', legend);
  // // await saveTxn(txn1, 'txn1', legend, './txn1.png');

  await txn1.sign([deployerKey]);

  // ----------------------------------------------------

  const txn2 = await Mina.transaction(deployerAccount, async () => {
    await proofsOnlyInstance.callSecondary(secondaryAddr);
  });

  await txn2.prove();

  // await showTxn(txn2, 'txn2', legend);
  // await saveTxn(txn2, 'txn2', legend, './txn2.png');

  await txn2.sign([deployerKey]).send();
})();
