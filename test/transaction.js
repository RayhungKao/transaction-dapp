const Transaction = artifacts.require("./Transaction.sol");

contract("Transaction", accounts => {
  it("...should initialize the balance sheet.", async () => {
    const transactionInstance = await Transaction.deployed();

    const owner = accounts[0];
    const seller = accounts[1];
    const buyer = accounts[2];
    const initial_balance = 1000;
    
    // Initialize seller's and buyer's balance sheet
    await transactionInstance.initBalanceSheet(seller, initial_balance, { from: owner });
    await transactionInstance.initBalanceSheet(buyer, initial_balance, { from: owner });

    // Get balance sheet from an account address
    const result = await transactionInstance.balanceSheets.call(seller);

    assert.equal(result['CashAccount'].words[0], initial_balance, "It should initialize CashAccount 1000.");
    assert.equal(result['ARAccount'].words[0], initial_balance, "It should initialize ARAccount 1000.");
    assert.equal(result['InventoryAccount'].words[0], initial_balance, "It should initialize InventoryAccount 1000.");
    assert.equal(result['CoGSAccount'].words[0], initial_balance, "It should initialize CoGSAccount 1000.");
    assert.equal(result['SalesAccount'].words[0], initial_balance, "It should initialize SalesAccount 1000.");
  
  });
  it("...should sell and buy an item.", async () => {
    const transactionInstance = await Transaction.deployed();

    const seller = accounts[1];
    const item = "car";
    const cost = 100;
    const price = 200;
    await transactionInstance.sell(item, cost, price, { from: seller });

    const buyer = accounts[2];
    const item_id = 0;
    await transactionInstance.buy(item_id, { from: buyer, value: price });

    const result = await transactionInstance.journalEntrys.call(item_id);

    assert.equal(result['item'], item, "It should create a journalEntry with correct item.");
    assert.equal(result['cost'].words[0], cost, "It should create a journalEntry with correct cost.");
    assert.equal(result['price'].words[0], price, "It should create a journalEntry with correct price.");
    assert.equal(result['buyer'], buyer, "It should create a journalEntry with correct buyer.");
    assert.equal(result['isBought'], true, "It should create a journalEntry with correct status.");
    assert.equal(result['isShipped'], false, "It should create a journalEntry with correct status.");
    assert.equal(result['isReceived'], false, "It should create a journalEntry with correct status.");
  
  });
  it("...should ship an item with correct balance sheet.", async () => {
    const transactionInstance = await Transaction.deployed();

    const seller = accounts[1];

    // ship
    const item_id = 0;
    await transactionInstance.ship(item_id, { from: seller });

    // verify journal entry
    const result = await transactionInstance.journalEntrys.call(item_id);

    assert.equal(result['isBought'], true, "It should create a journalEntry with correct status.");
    assert.equal(result['isShipped'], true, "It should create a journalEntry with correct status.");
    assert.equal(result['isReceived'], false, "It should create a journalEntry with correct status.");

    // verify balance sheet
    const initial_balance = 1000;
    const price = 200;

    const balanceSheet = await transactionInstance.balanceSheets.call(seller);

    assert.equal(balanceSheet['CashAccount'].words[0], initial_balance, "It should initialize CashAccount 1000.");
    assert.equal(balanceSheet['ARAccount'].words[0], initial_balance + price, "It should initialize ARAccount 1000.");
    assert.equal(balanceSheet['InventoryAccount'].words[0], initial_balance, "It should initialize InventoryAccount 1000.");
    assert.equal(balanceSheet['CoGSAccount'].words[0], initial_balance, "It should initialize CoGSAccount 1000.");
    assert.equal(balanceSheet['SalesAccount'].words[0], initial_balance + price, "It should initialize SalesAccount 1000.");
  
  });
  it("...should receive an item with correct balance sheet.", async () => {
    const transactionInstance = await Transaction.deployed();

    const seller = accounts[1];
    const buyer = accounts[2];

    // receive
    const item_id = 0;
    await transactionInstance.receiveGood(item_id, { from: buyer });

    // verify journal entry
    const result = await transactionInstance.journalEntrys.call(item_id);

    assert.equal(result['isBought'], true, "It should create a journalEntry with correct status.");
    assert.equal(result['isShipped'], true, "It should create a journalEntry with correct status.");
    assert.equal(result['isReceived'], true, "It should create a journalEntry with correct status.");

    // verify balance sheet
    const initial_balance = 1000;
    const cost = 100;
    const price = 200;

    const seller_balanceSheet = await transactionInstance.balanceSheets.call(seller);

    assert.equal(seller_balanceSheet['CashAccount'].words[0], initial_balance + price, "It should initialize CashAccount 1000.");
    assert.equal(seller_balanceSheet['ARAccount'].words[0], initial_balance, "It should initialize ARAccount 1000.");
    assert.equal(seller_balanceSheet['InventoryAccount'].words[0], initial_balance - cost, "It should initialize InventoryAccount 1000.");
    assert.equal(seller_balanceSheet['CoGSAccount'].words[0], initial_balance + cost, "It should initialize CoGSAccount 1000.");
    assert.equal(seller_balanceSheet['SalesAccount'].words[0], initial_balance + price, "It should initialize SalesAccount 1000.");
  
    const buyer_balanceSheet = await transactionInstance.balanceSheets.call(buyer);

    assert.equal(buyer_balanceSheet['CashAccount'].words[0], initial_balance - price, "It should initialize CashAccount 1000.");
    assert.equal(buyer_balanceSheet['ARAccount'].words[0], initial_balance, "It should initialize ARAccount 1000.");
    assert.equal(buyer_balanceSheet['InventoryAccount'].words[0], initial_balance + price, "It should initialize InventoryAccount 1000.");
    assert.equal(buyer_balanceSheet['CoGSAccount'].words[0], initial_balance, "It should initialize CoGSAccount 1000.");
    assert.equal(buyer_balanceSheet['SalesAccount'].words[0], initial_balance, "It should initialize SalesAccount 1000.");
  
  });
});
