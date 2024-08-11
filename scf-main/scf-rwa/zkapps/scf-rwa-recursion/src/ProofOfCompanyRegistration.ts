import {
  Field,
  method,
  Signature,
  SmartContract,
  Permissions,
  PublicKey,
  Struct,
  ZkProgram,
} from 'o1js';

import { CorporateRegistrationData, evalCorporateCompliance } from './ProofOfCompanyRegistration.utils.js';

export class PublicOutput extends Struct({
   corporateComplianceToProve: Field,
   currCompanyComplianceStatusCode: Field,
   creatorPublicKey: PublicKey,
}) {}

export const proofOfCompliance = ZkProgram({
  name: 'ZkProofOfCompliance',
  publicInput: Field, // complianceProofInBinary
  publicOutput: PublicOutput, // defined above
  methods: {
    proveCompliance: {
      privateInputs: [
        CorporateRegistrationData,
        Signature, // zkOracle data signature
        Signature, // creator wallet signature
        PublicKey, // creator wallet public key
      ],
      async method(
        corporateComplianceToProve: Field,
        corporateRegistrationData: CorporateRegistrationData,
        oracleSignature: Signature,
        creatorSignature: Signature,
        creatorPublicKey: PublicKey
      ): Promise<PublicOutput> {
        /*
          Verify zk-oracle signature

          Purpose: verify the zk-oracle signature, ensuring that the data remains 
          untampered with and aligns precisely with the information provided by 
          the KYC/digital ID provider.
        */
        const validSignature = oracleSignature.verify(
          PublicKey.fromBase58(
            'B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN'
            // TO DO INJECT KEY from docs2 for current purposes.. 

          ),
          CorporateRegistrationData.toFields(corporateRegistrationData)
        );
        validSignature.assertTrue();

        /*
          Verify creatorSignature

          Purpose: This section validates the creatorSignature to embed the public key 
          of the proof creator into the proof output. The rationale behind this inclusion 
          is to enable the party consuming the proof to optionally request the user to 
          confirm possession of the same address. This confirmation can be achieved by 
          prompting the user to sign a superficial message and provide evidence of ownership 
          of the corresponding account.
        */
        const validSignature_ = creatorSignature.verify(
          creatorPublicKey,
          CorporateRegistrationData.toFields(corporateRegistrationData)
        );
        validSignature_.assertTrue();

        // evalute corporate compliance
        const companyRegistration = evalCorporateCompliance(corporateRegistrationData.currCompanyComplianceStatusCode);

        // verify corporateCompliance to prove is NOT 0 - BAD

        corporateRegistrationData.currCompanyComplianceStatusCode.greaterThan(Field(0)).assertTrue();
      
        const corporateComplianceToProve1 = corporateRegistrationData.currCompanyComplianceStatusCode
          .greaterThan(Field(0));
          corporateComplianceToProve1.assertTrue();

        return new PublicOutput({
          corporateComplianceToProve:corporateComplianceToProve,
          currCompanyComplianceStatusCode:corporateRegistrationData.currCompanyComplianceStatusCode,
          creatorPublicKey: creatorPublicKey,
        });
      },
    },
  },
});

/*
Use the zkPragram defined above to create an on-chain smart contract that
consume the proof created by the program above and thus 'put' the proof on chain
*/
//export class ProofOfCompanyRegistration extends ZkProgram.Proof(proofOfCompliance) {}

export const ProofOfCompliance_ = ZkProgram.Proof(proofOfCompliance );
export class ProofOfCompliance extends ProofOfCompliance_ {}

export class ProofOfCompanyRegistrationProof extends ZkProgram.Proof(proofOfCompliance) {}

export class ProofOfCompanyRegistration extends SmartContract {
  events = {
    'provided-valid-proof': PublicOutput,
  };
  init() {
    super.init();
    // https://docs.minaprotocol.com/zkapps/o1js/permissions#types-of-permissions
    this.account.permissions.set({
      ...Permissions.default(),
    });
  }

  @method async verifyProof(proof:ProofOfCompliance) {
    // if the proof is invalid, this will fail
    // its impossible to run past this withought a valid proof
    proof.verify();

    // the above is enough to be able to check if an address has a proof

    // emit an event 

    this.emitEvent('provided-valid-proof', proof.publicOutput);
  }

}

const main = async () => {

  console.log('compiling...');

  const proof0 = await proofOfCompliance.compile();
  const proof1 = await ProofOfCompanyRegistration.compile();

  //console.log(' proof 1 public input...', proof1.verify);

}

main();
