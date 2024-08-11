import { Field, SelfProof, ZkProgram, verify, CircuitString, PrivateKey, Signature, Proof, Undefined } from 'o1js';
import { ProofOfCompanyRegistration } from './ProofOfCompanyRegistration';
import { proofOfCompliance, ProofOfCompanyRegistrationProof,ProofOfCompliance,PublicOutput, ProofOfCompliance_  } from './ProofOfCompanyRegistration';
import { CorporateRegistrationData, evalCorporateCompliance } from './ProofOfCompanyRegistration.utils.js';
import { ProofOfInternationalTradeComplianceProof, ProofOfComplianceEXIM_, proofOfComplianceEXIM } from './ProofOfInternationalTradeCompliance.js';
import { InternationalTradeComplianceData, evalInternationalTradeCompliance, } from './ProofOfInternationalTradeCompliance.utils.js';
import { sign } from 'o1js/dist/node/mina-signer/src/signature';


const Add = ZkProgram({
  name: 'add-example',
  publicInput: Field,
  publicOutput: PublicOutput,

  methods: {
    //init: {
     // privateInputs: [],
     //
    //    async method(state: Field) {
    //    state.assertEquals(Field(0));
     // },
    //},

     composedRecursiveProof: {
      privateInputs: [ProofOfCompliance_, ProofOfComplianceEXIM_],
     
        async method(f: Field, proofOfCompanyRegistration: Proof<Field, PublicOutput>, proofOfInternationalTradeCompliance: Proof<Field, PublicOutput>) {

          proofOfCompanyRegistration.verify()
          proofOfInternationalTradeCompliance.verify()
          return new PublicOutput({
           corporateComplianceToProve: Field(1),
           currCompanyComplianceStatusCode: Field(1),
           creatorPublicKey: PrivateKey.random().toPublicKey()
          });

      },
    },


  },
});


//const proof1 = await ProofOfCompanyRegistration.compile();


const main = async () => {

  console.log('compiling... testing add.. ');
  const { verificationKey } = await Add.compile();

  //console.log('making proof 0');
  //const proof0 = await Add.init(Field(0));

  const corporateRegistrationDataRaw = {
    companyID:'101',
    companyName:'India Exports 1',
    mcaID: '201',
    businessPANID: '1001',
    currCompanyComplianceStatusCode:'1',
  };
  
  let corporateRegistrationData = new CorporateRegistrationData({
    companyID: CircuitString.fromString(corporateRegistrationDataRaw.companyID),
    companyName: CircuitString.fromString(corporateRegistrationDataRaw.companyName),
    mcaID: CircuitString.fromString(corporateRegistrationDataRaw.mcaID),
    businessPANID: CircuitString.fromString(corporateRegistrationDataRaw.businessPANID),
    currCompanyComplianceStatusCode: Field(corporateRegistrationDataRaw.currCompanyComplianceStatusCode),
  });

  const internationalTradeComplianceDataRaw = {
    companyID:'101',
    companyName:'India Exports 1',
    dgftID: '301',
    businessPANID: '1001',
    currEXIMComplianceStatusCode:'1',
  };

  const internationalTradeComplianceData = new InternationalTradeComplianceData({
    companyID: CircuitString.fromString(internationalTradeComplianceDataRaw.companyID),
    companyName: CircuitString.fromString(internationalTradeComplianceDataRaw.companyName),
    dgftID: CircuitString.fromString(internationalTradeComplianceDataRaw.dgftID),
    businessPANID: CircuitString.fromString(internationalTradeComplianceDataRaw.businessPANID),
    currEXIMComplianceStatusCode: Field(internationalTradeComplianceDataRaw.currEXIMComplianceStatusCode),
  });

  proofOfCompliance.compile();
  ProofOfCompanyRegistration.compile();

  let testPrivateKey = PrivateKey.random()
  let testPublicKey  = testPrivateKey.toPublicKey()

    //privateKey: privateKey.toBase58(),
    //publicKey: privateKey.toPublicKey().toBase58()
   let signature = Signature.create(testPrivateKey, CorporateRegistrationData.toFields(corporateRegistrationData));

  let proof1 = await proofOfCompliance.proveCompliance(corporateRegistrationData.currCompanyComplianceStatusCode, corporateRegistrationData,signature,signature,testPublicKey);

  let proof2 = await proofOfComplianceEXIM.proveCompliance(internationalTradeComplianceData.currEXIMComplianceStatusCode, internationalTradeComplianceData,signature,signature,testPublicKey);

  //let composedRecursiveProof = await Add.composedRecursiveProof(proof1,proof2)


  
  //proofOfCompliance.compile();
  //ProofOfCompanyRegistration.compile();
 
  console.log('making proof 1');

 // const proof1 = await ProofOfCompanyRegistration.

  //console.log('making proof 2');

  //const proof2 = await Add.add(Field(4), proof1, proof0);

  //console.log('verifying proof 2');
  //console.log('proof 2 data', proof2.publicInput.toString());

  //const ok = await verify(proof2.toJSON(), verificationKey);
 // console.log('ok', ok);
}

main();
