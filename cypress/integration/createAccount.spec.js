import Requests from "../integration/Requests/requests";

describe("Test Access Token API's", () => {
  //Generate the Access Token
  it("Generate a JWT token", () => {
    Requests.getAccessToken();
  });

  //Validate the generation of JWT token to be used in all the requests
  it("Validate the generated JWT token", () => {
    Requests.validateAccessToken();
  });

  //Create a new account
  it("Create a new Account", () => {
    Requests.createAccount();
  });

  //Validate the Creation of an Account
  it("Validate the Creation of Account", () => {
    Requests.accountCreationValidation();
  });

  //Get the balance of an Account
  it("Get Balance of an Account", () => {
    Requests.getAccountBalance();
  });

  //Deducting Amount and Validating if the amount is deducted from the balance
  it("Transaction - Deduction of Amount", () => {
    Requests.createTransaction();
  });

  //Adding amount to make sure that the final balance does not reach 0
  it("Transaction - Addition of Amount", () => {
    Requests.addMoney();
  });
});
