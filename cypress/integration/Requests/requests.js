/// <reference types= "cypress" />
const requestData = require("../../fixtures/requestValues.json");

let accessToken;
let $accountId;
let $personId;
let $personName;
let $balance;

class Requests {
  getAccessToken() {
    cy.request({
      method: "POST",
      url: "https://auth-api.sandbox.tuumplatform.com/api/v1/employees/authorise",
      body: {
        username: requestData.username,
        password: requestData.password,
      },
    }).then(($res) => {
      expect($res.status).to.eq(200);
      accessToken = $res.body.data.token;
    });
  }
  validateAccessToken() {
    expect(accessToken).to.not.be.null;
    expect(accessToken).to.not.be.undefined;
  }
  createAccount() {
    cy.request({
      method: "POST",
      url:
        "https://account-api.sandbox.tuumplatform.com/api/v2/persons/" +
        requestData.masterAccountId +
        "/accounts",
      headers: {
        "x-channel-code": requestData.x_channel_code,
        "x-tenant-code": requestData.x_tenant_code,
        "x-auth-token": accessToken,
      },
      body: {
        accountTypeCode: requestData.accountTypeCode,
        masterAccountId: requestData.masterAccountId,
        accountName: requestData.accountName,
        personName: requestData.personName,
        source: {
          sourceName: requestData.sourceName,
          sourceRef: requestData.sourceRef,
        },
        residencyCountryCode: requestData.residencyCountryCode,
        customerGroupCode: requestData.customerGroupCode,
        priceListTypeCode: requestData.priceListTypeCode,
        currencyCode: requestData.currencyCode,
      },
    }).then(($res) => {
      expect($res.status).to.eql(200);
      $accountId = $res.body.data.accountId;
      $personId = $res.body.data.personId;
      $personName = $res.body.data.personName;
    });
  }
  accountCreationValidation() {
    expect($accountId).to.not.be.undefined;
    expect($accountId).to.not.be.null;
    expect($personId).to.eql(requestData.masterAccountId);
    expect($personName).to.eql(requestData.personName);
  }
  getAccountBalance() {
    cy.request({
      method: "GET",
      url:
        "https://account-api.sandbox.tuumplatform.com/api/v1/accounts/" +
        requestData.masterAccountId +
        "/balances",
      headers: {
        "x-channel-code": requestData.x_channel_code,
        "x-tenant-code": requestData.x_tenant_code,
        "x-auth-token": accessToken,
      },
    }).then(($res) => {
      expect($res.status).to.eql(200);
      let $bal = $res.body.data;
      expect($bal[0].balanceId).to.eq(requestData.masterAccountId);
      expect($bal[0].currencyCode).to.eql(requestData.currencyCode);
      $balance = $bal[0].balanceAmount;
      expect($bal[0].balanceAmount).to.not.be.undefined;
      expect($bal[0].balanceAmount).to.not.be.null;
      expect($bal[0].reservedAmount).to.not.be.undefined;
      expect($bal[0].reservedAmount).to.not.be.null;
    });
  }
  createTransaction() {
    cy.request({
      method: "POST",
      url:
        "https://account-api.sandbox.tuumplatform.com/api/v3/accounts/" +
        requestData.masterAccountId +
        "/transactions",
      headers: {
        "x-channel-code": requestData.x_channel_code,
        "x-tenant-code": requestData.x_tenant_code,
        "x-auth-token": accessToken,
      },
      body: {
        transactionTypeCode: requestData.transactionTypeCodePurchase,
        money: {
          amount: requestData.amountPurchased,
          currencyCode: requestData.currencyCode,
        },
        details: requestData.detailsPurchase,
        source: {
          sourceName: requestData.sourceNamePurchase,
          sourceRef: requestData.sourceRefPurchase,
        },
      },
    }).then(($res) => {
      expect($res.status).to.eql(200);
      expect($res.body.data[0].accountTransactionId).to.not.be.undefined;
      expect($res.body.data[0].accountTransactionId).to.not.be.null;
      expect($res.body.data[0].accountId).to.eq(requestData.masterAccountId);
      expect($res.body.data[0].transactionTypeCode).to.eq(
        requestData.transactionTypeCodePurchase
      );
      expect($res.body.data[0].amount).to.eq(requestData.amountPurchased);
      let $finalBalance =
        $res.body.data[0].initialBalanceAmount - requestData.amountPurchased;
      expect($finalBalance).to.eq($balance - requestData.amountPurchased);
    });
  }
  addMoney() {
    cy.request({
      method: "POST",
      url:
        "https://account-api.sandbox.tuumplatform.com/api/v3/accounts/" +
        requestData.masterAccountId +
        "/transactions",
      headers: {
        "x-channel-code": requestData.x_channel_code,
        "x-tenant-code": requestData.x_tenant_code,
        "x-auth-token": accessToken,
      },
      body: {
        transactionTypeCode: requestData.transactionTypeCodeTopup,
        money: {
          amount: requestData.amountTopup,
          currencyCode: requestData.currencyCode,
        },
        details: requestData.detailsTopup,
        source: {
          sourceName: requestData.sourceNameTopup,
          sourceRef: requestData.sourceRefTopup,
        },
      },
    }).then(($res) => {
      expect($res.status).to.eql(200);
      expect($res.body.data[1].accountTransactionId).to.not.be.undefined;
      expect($res.body.data[1].accountTransactionId).to.not.be.null;
      expect($res.body.data[1].accountId).to.eq(requestData.masterAccountId);
      expect($res.body.data[1].transactionTypeCode).to.eq(
        requestData.transactionTypeCodeTopup
      );
      expect($res.body.data[1].amount).to.eq(requestData.amountTopup);
      let $transactionFee = $res.body.data[0].amount;
      let $finalBalance =
        $res.body.data[1].initialBalanceAmount +
        requestData.amountTopup -
        $transactionFee;
      expect($finalBalance).to.eq(
        $res.body.data[0].initialBalanceAmount - $transactionFee
      );
    });
  }
}

module.exports = new Requests();
