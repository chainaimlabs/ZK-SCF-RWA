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

class InternationalTradeComplianceData extends Struct({
  companyID: CircuitString,
  companyName: CircuitString,
  dgftID: CircuitString,
  businessPANID: CircuitString,
  currEXIMComplianceStatusCode: Field,
  //currentDate: Field,
}) {
  // method for signature creation and verification
  //toFields(): Field[] {
    //return [
     // ...this.companyID.values.map((item) => item.toField()),
     // ...this.companyName.values.map((item) => item.toField()),
     // ...this.dgftID.values.map((item) => item.toField()),
     // ...this.businessPANID.values.map((item) => item.toField()),
      //...this.currEXIMComplianceStatusCode.values.map((item) => item.toField()),
      //this.currentDate,
    //];
  //}
}


const zkOracleResponseMock = () => {
  const TESTING_PRIVATE_KEY: string = process.env.TESTING_PRIVATE_KEY as string;
  const privateKey = PrivateKey.fromBase58(TESTING_PRIVATE_KEY);
  const publicKey = privateKey.toPublicKey();

  const data = {
    companyID:'101',
    companyName:'India Exports 1',
    dgftID: '301',
    businessPANID: '1001',
    currEXIMComplianceStatusCode:Field(1),
  };

  const internationalTradeComplianceData = new InternationalTradeComplianceData({
    companyID: CircuitString.fromString(data.companyID),
    companyName: CircuitString.fromString(data.companyName),
    dgftID: CircuitString.fromString(data.dgftID),
    businessPANID: CircuitString.fromString(data.businessPANID),
    currEXIMComplianceStatusCode: Field(data.currEXIMComplianceStatusCode),
  });

  const signature = Signature.create(privateKey, InternationalTradeComplianceData.toFields(internationalTradeComplianceData));

  return {
    data: data,
    signature: signature.toJSON(),
    publicKey: publicKey.toBase58(),
  };
};

const evalInternationalTradeCompliance = (currEXIMComplianceStatusCode: Field): Field => {

  const eximCompliance = currEXIMComplianceStatusCode
  .mul(Field(100))
  return eximCompliance;
  
  };

export { InternationalTradeComplianceData, evalInternationalTradeCompliance, zkOracleResponseMock };