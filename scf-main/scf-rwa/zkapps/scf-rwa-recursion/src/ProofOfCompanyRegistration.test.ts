// Import statements from both files
import { proofOfCompanyRegistration, ProofOfCompanyRegistration, proofOfCompanyRegistrationProof, ProofOfCompanyRegistrationProof } from './ProofOfCompanyRegistration.js';

//import { proofOfCompanyRegistration, ProofOfCompanyRegistration, ProofOfCompanyRegistrationProof, ProofOfCompanyRegistrationProof } from 'ZK-SCF-RWA\scf-main\scf-rwa\zkapps\scf-rwa-recursion\src\ProofOfCompanyRegistration.ts';

import {
  CorporateRegistrationData,
  zkOracleResponseMock,
  evalCorporateCompliance,
  // verifyOracleData,
} from './ProofOfCompanyRegistration.utils.js';

import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  CircuitString,
  Signature,
  JsonProof,
  Cache,
} from 'o1js';


describe('ProofOfCompanyRegistration', () => {


    beforeAll(async () => {
        // cache
        const cache: Cache = Cache.FileSystem('./cache');
        // zkProgram that produce the proof that
        // is submitted to the on chain program
        await proofOfCompanyRegistraion.compile({ cache });
        // on chain smart contract that consume the
        // proof create by the zkProgram compiled above
        await ProofOfCompanyRegistration.compile({ cache });
      });


 /*
    Part 1

    Testing the zkProgram that produces the main proof.
    This proof might be submitted to the other zk program
    That sits on chain and consumes the proof created by
    this zkProgram.
  */

    it('zkProgram: verifies zkOracle response data', async () => {
        const zkOracleResponse = zkOracleResponseMock();

     
        const corporateRegistrationData = new CorporateRegistrationData({
            companyID: CircuitString.fromString(data.companyID),
            companyName: CircuitString.fromString(data.companyName),
            mcaID: CircuitString.fromString(data.mcaID),
            businessPANID: CircuitString.fromString(data.businessPANID),
            currCompanyComplianceStatusCode: Field(data.currCompanyComplianceStatusCode),
          });

        const signature = Signature.fromJSON(zkOracleResponse.signature);
        const validSignature = signature.verify(
          PublicKey.fromBase58(zkOracleResponse.publicKey),
          corporateRegistrationData.toFields()
        );
        expect(validSignature.toBoolean()).toBe(true);

      });


      it('zkProgram: evaluates corporate compliance ', async () => {
        const zkOracleResponse = zkOracleResponseMock();

        const corporateCompliance = evalCorporateCompliance(
            Field(zkOracleResponse.data.currCompanyComplianceStatusCode)

        );

        expect(corporateCompliance).toBeDefined();
      });


      it('zkProgram: produces proof', async () => {
        const zkOracleResponse = zkOracleResponseMock();


        const corporateComplianceToProve = 1;
            const corporateRegistrationData = new CorporateRegistrationData({
            companyID: CircuitString.fromString(zkOracleResponse.data.companyID),
            companyName: CircuitString.fromString(zkOracleResponse.data.companyName),
            mcaID: CircuitString.fromString(zkOracleResponse.data.mcaID),
            businessPANID: CircuitString.fromString(zkOracleResponse.data.businessPANID),
            currCompanyComplianceStatusCode: Field(zkOracleResponse.data.currCompanyComplianceStatusCode),
          });
    
        const creatorPrivateKey = PrivateKey.random();
        const creatorPublicKey = creatorPrivateKey.toPublicKey();
        const creatorDataSignature = Signature.create(
          creatorPrivateKey,
          corporateRegistrationData.toFields()
        );
    
        const proof = await proofOfCompanyRegistraion.proveCompliance(
          Field(corporateComplianceToProve),
          corporateRegistrationData,
          Signature.fromJSON(zkOracleResponse.signature),
          creatorDataSignature,
          creatorPublicKey
        );


        const proofJson = proof.toJSON();
        expect(proofJson.publicInput[0]).toBe(corporateComplianceToProve.toString());
        expect(proofJson.publicOutput[0]).toBe(corporateComplianceToProve.toString());
        expect(proofJson.publicOutput[1]).toBe('1');
        expect(
          PublicKey.fromFields([
            Field(proofJson.publicOutput[2]),
            Field(proofJson.publicOutput[3]),
          ]).toBase58()
        ).toBe(creatorPublicKey.toBase58());
        // console.log(`proof: ${JSON.stringify(proof.toJSON()).slice(0, 100)} ...`);
      });


  /*
    Part 2

    Testing the on chain smart contract that consumes the main proof.
    Upon consuming the proof it will tie the senders address
    with the fact that it has a valid proof.
  */

    let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: ProofOfCompanyRegistration;


    async function localDeploy() {
        // setup local blockchain
        const proofsEnabled = true;
        const Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);
    
        deployerKey = Local.testAccounts[0].key;
        deployerAccount = PublicKey.fromPrivateKey(deployerKey);
        senderKey = Local.testAccounts[0].key;
        senderAccount = PublicKey.fromPrivateKey(senderKey);
        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
    
        // deploy smart contract
        zkApp = new ProofOfCompanyRegistration(zkAppAddress);
        const txn = await Mina.transaction(deployerAccount, async () => {
          AccountUpdate.fundNewAccount(deployerAccount);
          zkApp.deploy();
        });
        await txn.prove();
        await txn.sign([deployerKey, zkAppPrivateKey]).send();
      }

      it('smart contract: generates and deploys', async () => {
        await localDeploy();
      });

      it('smart contract: consumes the proof and runs method', async () => {
        await localDeploy();
    
        // create the zkProgram proof
        const zkOracleResponse = zkOracleResponseMock();
   
        const corporateComplianceToProve = 1;

        const corporateRegistrationData = new CorporateRegistrationData({
            companyID: CircuitString.fromString(zkOracleResponse.data.companyID),
            companyName: CircuitString.fromString(zkOracleResponse.data.companyName),
            mcaID: CircuitString.fromString(zkOracleResponse.data.mcaID),
            businessPANID: CircuitString.fromString(zkOracleResponse.data.businessPANID),
            currCompanyComplianceStatusCode: Field(zkOracleResponse.data.currCompanyComplianceStatusCode),
          });

      
        const creatorPrivateKey = PrivateKey.random();
        const creatorPublicKey = creatorPrivateKey.toPublicKey();
        const creatorDataSignature = Signature.create(
          creatorPrivateKey,
          CorporateRegistrationData.toFields()
        );
    
        const proof = await proofOfCompanyRegistraion.proveAge(
          Field(corporateComplianceToProve)),
          corporateRegistrationDataData,
          Signature.fromJSON(zkOracleResponse.signature),
          creatorDataSignature,
          creatorPublicKey
        );
        const proofJson = proof.toJSON();
    
        // parse zkPorgram proof from JSON
        const proof_ = await ProofOfCompanyRegistrationProof.fromJSON(proofJson as JsonProof);
    
        // update transaction
        const txn = await Mina.transaction(senderAccount, async () => {
          await zkApp.verifyProof(proof_);
        });
        await txn.prove();
        await txn.sign([senderKey]).send();
      });

});