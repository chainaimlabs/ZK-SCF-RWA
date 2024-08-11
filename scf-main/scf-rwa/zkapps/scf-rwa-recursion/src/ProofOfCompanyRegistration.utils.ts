import 'dotenv/config';
import {
  Field,
  PrivateKey,
  Signature,
  CircuitString,
  Circuit,
  Struct,
  Provable,
} from 'o1js';

class CorporateRegistrationData extends Struct({
  companyID: CircuitString,
  companyName: CircuitString,
  mcaID: CircuitString,
  businessPANID: CircuitString,
  currCompanyComplianceStatusCode: Field,
  //currentDate: Field,
}) {
  // method for signature creation and verification
  // toFields(): Field[] {
  //   return [
  //     ...this.companyID.values.map((item) => item.toField()),
  //     ...this.companyName.values.map((item) => item.toField()),
  //     ...this.mcaID.values.map((item) => item.toField()),
  //     ...this.businessPANID.values.map((item) => item.toField()),
  //     //...this.currCompanyComplianceStatusCode.values.map((item) => item.toField()),
  //     //this.currentDate,
  //   ];
 // }
}

const zkOracleResponseMock = () => {
  const TESTING_PRIVATE_KEY: string = process.env.TESTING_PRIVATE_KEY as string;

const privateKey = PrivateKey.random();

//const privateKey = PrivateKey.fromBase58(TESTING_PRIVATE_KEY);

  const publicKey  = privateKey.toPublicKey();

  const data = {
    companyID:'101',
    companyName:'India Exports 1',
    mcaID: '201',
    businessPANID: '1001',
    currCompanyComplianceStatusCode:'1',
  };

  const corporateRegistrationData = new CorporateRegistrationData({
    companyID: CircuitString.fromString(data.companyID),
    companyName: CircuitString.fromString(data.companyName),
    mcaID: CircuitString.fromString(data.mcaID),
    businessPANID: CircuitString.fromString(data.businessPANID),
    currCompanyComplianceStatusCode: Field(data.currCompanyComplianceStatusCode),
  });

  const signature = Signature.create(privateKey, CorporateRegistrationData.toFields(corporateRegistrationData));
  //signature.verify(privateKey.toPublicKey(), CorporateRegistrationData.toFields(corporateRegistrationData))

  return {
    data: data,
    signature: signature.toJSON(),
    publicKey: publicKey.toBase58(),
  };
};

const evalCorporateCompliance = (currCompanyComplianceStatusCode: Field): Field => {

  console.log( ' in val  ',  currCompanyComplianceStatusCode )
  const corpCompliance = currCompanyComplianceStatusCode
  .mul(Field(1))
  return corpCompliance;
  
  };

export { CorporateRegistrationData, evalCorporateCompliance, zkOracleResponseMock };

const main = async () => {

  console.log('running evel ...');
  
  //const ret = evalCorporateCompliance(Field(0));

  const ret = evalCorporateCompliance(Field(1));

  console.log('ret ...' , ret);

  // const proof0 = await ProofOfCompliance.compile();
  // const proof1 = await ProofOfCompanyRegistration.utils.compile();

  //console.log(' proof 1 public input...', proof1.verify);

}

main();