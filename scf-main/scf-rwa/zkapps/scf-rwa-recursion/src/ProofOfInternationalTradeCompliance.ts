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

import { InternationalTradeComplianceData, evalInternationalTradeCompliance } from './ProofOfInternationalTradeCompliance.utils.js';

class PublicOutput extends Struct({
   internationalTradeComplianceToProve: Field,
   currEXIMComplianceStatusCode: Field,
   creatorPublicKey: PublicKey,
}) {}

export const proofOfComplianceEXIM = ZkProgram({
  name: 'ZkProofOfComplianceEXIM',
  publicInput: Field, // complianceProofInBinary
  publicOutput: PublicOutput, // defined above
  methods: {
    proveCompliance: {
      privateInputs: [
        InternationalTradeComplianceData,
        Signature, // zkOracle data signature
        Signature, // creator wallet signature
        PublicKey, // creator wallet public key
      ],
      async method(
        internationalTradeComplianceToProve: Field,
        internationalTradeComplianceData: InternationalTradeComplianceData,
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
          InternationalTradeComplianceData.toFields(internationalTradeComplianceData)
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
          InternationalTradeComplianceData.toFields(internationalTradeComplianceData)
        );
        validSignature_.assertTrue();

        // evalute corporate compliance
        const internationalTradeCompliance = evalInternationalTradeCompliance(internationalTradeComplianceData.currEXIMComplianceStatusCode);

        // verify corporateCompliance to prove is NOT 0 - BAD

        internationalTradeComplianceData.currEXIMComplianceStatusCode.greaterThan(Field(0)).assertTrue();
      
        const internationalTradeComplianceToProve1 = internationalTradeComplianceData.currEXIMComplianceStatusCode
          .greaterThan(Field(0));
          internationalTradeComplianceToProve1.assertTrue();

        return new PublicOutput({
          internationalTradeComplianceToProve:internationalTradeComplianceToProve,
          currEXIMComplianceStatusCode:internationalTradeComplianceData.currEXIMComplianceStatusCode,
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

const ProofOfComplianceEXIM_ = ZkProgram.Proof(proofOfComplianceEXIM );
class ProofOfComplianceEXIM extends ProofOfComplianceEXIM_ {}

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

  @method async verifyProof(proof:ProofOfComplianceEXIM) {
    // if the proof is invalid, this will fail
    // its impossible to run past this withought a valid proof
    proof.verify();

    // the above is enough to be able to check if an address has a proof

    // emit an event 

    this.emitEvent('provided-valid-proof', proof.publicOutput);
  }
}
