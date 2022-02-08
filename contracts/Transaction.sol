pragma solidity >=0.7.0 <0.9.0;

contract Transaction {
    address public owner;
    address public seller;
        
    struct JournalEntry {
        uint txId;
        string item;
        uint cost;
        uint price;
        address buyer;
        bool isBought;
        bool isShipped;
        bool isReceived;
    }
    
    struct BalanceSheet {
        uint CashAccount;
        uint ARAccount;
        uint InventoryAccount;
        uint CoGSAccount;
        uint SalesAccount;
    }

    JournalEntry [] public journalEntrys;
    mapping(address => BalanceSheet) public balanceSheets;  
    
    event OwnerSet(address owner);
    event SellerSet(address seller);
    
    // modifier to check if sender is owner
    modifier isOwner() {
        require(msg.sender == owner, "MSG.SENDER is not Owner");
        _;
    }
    // modifier to check if sender is seller
    modifier isSeller() {
        require(msg.sender == seller, "MSG.SENDER is not Seller");
        _;
    }
    
    /**
     * @dev Set contract deployer as contract owner
     */
    constructor() {
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(owner);
    }
    
    function initBalanceSheet(address accountAddress, uint initBalance) public isOwner {    
        balanceSheets[accountAddress].CashAccount = initBalance;
        balanceSheets[accountAddress].ARAccount = initBalance;
        balanceSheets[accountAddress].InventoryAccount = initBalance;
        balanceSheets[accountAddress].CoGSAccount = initBalance;
        balanceSheets[accountAddress].SalesAccount = initBalance;
    }

    function sell(string memory item, uint cost, uint price) public {
        seller = msg.sender;
        emit SellerSet(seller);

        journalEntrys.push(JournalEntry({
            txId: journalEntrys.length,
            item: item,
            cost: cost,
            price: price,
            buyer: address(0x0),
            isBought: false,
            isShipped: false,
            isReceived: false
        }));
    }
            
    function buy(uint id) public payable {
        require(journalEntrys[id].isBought == false, "Already bought.");
        require(msg.value == journalEntrys[id].price, "Not correct payment.");
    
        journalEntrys[id].buyer = msg.sender;
        journalEntrys[id].isBought = true;
    }
    
    function ship(uint id) public isSeller {
        require(journalEntrys[id].isBought == true, "Not bought yet.");
        require(journalEntrys[id].isShipped == false, "Already shipped.");
        
        journalEntrys[id].isShipped = true;
        
        balanceSheets[seller].ARAccount += journalEntrys[id].price;
        balanceSheets[seller].SalesAccount += journalEntrys[id].price;
    }
    
    function receiveGood(uint id) public payable {
        require(msg.sender == journalEntrys[id].buyer, "msg.sender is not THE Buyer");
        require(journalEntrys[id].isShipped == true, "Not shipped yet.");
        require(journalEntrys[id].isReceived == false, "Already received.");
        
        address payable sellerWallet = payable(seller);
        sellerWallet.transfer(journalEntrys[id].price);

        journalEntrys[id].isReceived = true;
        
        balanceSheets[seller].CashAccount += journalEntrys[id].price;
        balanceSheets[seller].ARAccount -= journalEntrys[id].price;
        balanceSheets[seller].CoGSAccount += (journalEntrys[id].cost);
        balanceSheets[seller].InventoryAccount -= (journalEntrys[id].cost);
        
        balanceSheets[msg.sender].InventoryAccount += journalEntrys[id].price;
        balanceSheets[msg.sender].CashAccount -= journalEntrys[id].price;
    }
}