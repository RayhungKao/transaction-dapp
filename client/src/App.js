import React, { Component } from "react";
import TransactionContract from "./contracts/Transaction.json";
import getWeb3 from "./getWeb3";
import {Container, Button, Form, Row, Col} from 'react-bootstrap'

import "./App.css";

class App extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      address: null,
      balance: null,
      sellerAddress: null,
      buyerAddress: null,
      sellerBalance: null,
      BuyerBalance: null,
      itemSale: null,
      costSale: null,
      priceSale: null,
      item: null, 
      cost: null,
      price: null, 
      txid: null,
      buyer: null, 
      isBought: null,
      isShipped: null,
      isReceived: null,
      web3: null, 
      accounts: null, 
      contract: null,
      sellerBS: [],
      buyerBS: []
    };
    this.handleSell = this.handleSell.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
    
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TransactionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        TransactionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.trade);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInitBalance = async (e) => {
    e.preventDefault()
    
    const {accounts, contract, initAddress, initBalance} = this.state;

    console.log(this.state);

    const owner = await contract.methods.owner().call();
    console.log(owner);

    await contract.methods.initBalanceSheet(initAddress, initBalance)
      .send({ from: accounts[0] })
      .on('receipt', (receipt) => {
        console.log("result: ", receipt)
      })
      .on('error', console.error);
  }

  handleGetBalance = async (e, isSeller) => {
    e.preventDefault()

    const {contract, sellerAddress, buyerAddress} = this.state;

    console.log(this.state);

    if (isSeller === true) {
      // // Get the value from the contract to prove it worked.
      const sellerBS = await contract.methods.balanceSheets(sellerAddress).call();
      await this.setState({sellerBS: sellerBS});
      console.log(sellerBS);
    }
    else { // Get the value from the contract to prove it worked.
      const buyerBS = await contract.methods.balanceSheets(buyerAddress).call();
      await this.setState({buyerBS: buyerBS});
      console.log(buyerBS);
    }
  }

  handleGetJournalEntry = async (e) => {
    e.preventDefault()

    const {contract, txid} = this.state;

    console.log(this.state);

    const response = await contract.methods.journalEntrys(txid).call();
    await this.setState({
      item: response['item'],
      cost: response['cost'],
      price: response['price'],
      buyer: response['buyer'],
      isBought: response['isBought'].toString(),
      isShipped: response['isShipped'].toString(),
      isReceived: response['isReceived'].toString()
    });
    console.log(response);
  }

  handleSell = async (e) => {
    e.preventDefault()

    const {itemSale, costSale, priceSale, accounts, contract } = this.state;
    console.log(this.state);
    console.log(accounts[0]);

    // Stores value to the contract
    await contract.methods.sell(itemSale, costSale, priceSale)
      .send({ from: accounts[0] })
      .on('receipt', (receipt) => {
        console.log('this should be executed now')
        console.log("result: ", receipt)
        console.log("Value submitted on blockchain!")
      })
      .on('error', console.error);
    
  }

  handleBuy = async (e) => {
    const {accounts, contract, price, txid} = this.state;

    console.log(this.state);

    // const priceToWei = price*(10**18);
    // console.log(price);
    // console.log(priceToWei);

    // // // Stores value to the contract
    await contract.methods.buy(txid)
      .send({ from: accounts[0], value: price })
      .on('receipt', (receipt) => {
        console.log('this should be executed now')
        console.log("result: ", receipt)
        console.log("Value submitted on blockchain!")
      })
      .on('error', console.error);

    // Update Real-time Product Status to check it worked.
    const response = await contract.methods.journalEntrys(txid).call();
    await this.setState({
      item: response['item'],
      cost: response['cost'],
      price: response['price'],
      buyer: response['buyer'],
      isBought: response['isBought'].toString(),
      isShipped: response['isShipped'].toString(),
      isReceived: response['isReceived'].toString()
    });
    console.log(response);

    // Update Buyer's Balance Sheet to check it worked.
    const buyerBS = await contract.methods.balanceSheets(accounts[0]).call();
    await this.setState({buyerBS: buyerBS});
    console.log(buyerBS);
  }

  handleShip = async (e) => {
    const {accounts, contract, txid} = this.state;

    console.log(this.state);

    // // // Stores value to the contract
    await contract.methods.ship(txid)
      .send({ from: accounts[0] })
      .on('receipt', (receipt) => {
        console.log('this should be executed now')
        console.log("result: ", receipt)
        console.log("Value submitted on blockchain!")
      })
      .on('error', console.error);

    // Update Real-time Product Status to check it worked.
    const response = await contract.methods.journalEntrys(txid).call();
    await this.setState({
      item: response['item'],
      cost: response['cost'],
      price: response['price'],
      buyer: response['buyer'],
      isBought: response['isBought'].toString(),
      isShipped: response['isShipped'].toString(),
      isReceived: response['isReceived'].toString()
    });
    console.log(response);

    // Update Seller's Balance Sheet to check it worked.
    const sellerBS = await contract.methods.balanceSheets(accounts[0]).call();
    await this.setState({sellerBS: sellerBS});
    console.log(sellerBS);
  }

  handleReceive = async (e) => {
    const {accounts, contract, txid} = this.state;

    console.log(this.state);

    // // // Stores value to the contract
    await contract.methods.receiveGood(txid)
      .send({ from: accounts[0] })
      .on('receipt', (receipt) => {
        console.log('this should be executed now')
        console.log("result: ", receipt)
        console.log("Value submitted on blockchain!")
      })
      .on('error', console.error);

    // Update Real-time Product Status to check it worked.
    const response = await contract.methods.journalEntrys(txid).call();
    await this.setState({
      item: response['item'],
      cost: response['cost'],
      price: response['price'],
      buyer: response['buyer'],
      isBought: response['isBought'].toString(),
      isShipped: response['isShipped'].toString(),
      isReceived: response['isReceived'].toString()
    });
    console.log(response);

    // Update Seller's Balance Sheet to check it worked.
    const sellerAddress = await contract.methods.seller().call();
    await this.setState({sellerAddress: sellerAddress});

    const sellerBS = await contract.methods.balanceSheets(this.state.sellerAddress).call();
    await this.setState({sellerBS: sellerBS});
    console.log(sellerBS);

    // Update Buyer's Balance Sheet to check it worked.
    const buyerBS = await contract.methods.balanceSheets(accounts[0]).call();
    await this.setState({buyerBS: buyerBS});
    console.log(buyerBS);
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Transaction Dapp</h1>
        <div>The current user is: {this.state.accounts}</div>
        <br />
        <Container>
          <Row>
            <Form>
              <Form.Label>Initialize balance sheet (*Contract owner only)</Form.Label>
              <Form.Group className="mb-1">
                <Form.Control placeholder="Address" onChange={(e) => this.setState({initAddress: e.target.value})}/>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Control placeholder="Balance" onChange={(e) => this.setState({initBalance: e.target.value})}/>
              </Form.Group>
              <Button variant="info" type="submit" onClick={(e) => this.handleInitBalance(e) }>Init Balance</Button>
            </Form>
          </Row>
        </Container>
        <br></br>
        <Container>
          <Row>
            <Col>
              <h4>Seller</h4>
              <Form>
                <Form.Group className="mb-1">
                  <Form.Control placeholder="Address" onChange={(e) => this.setState({sellerAddress: e.target.value})}/>
                </Form.Group>
                <Button variant="info" type="submit" onClick={(e) => this.handleGetBalance(e, true) }>Get Balance Sheet</Button>
              </Form>
              <Row>
                <Col> Cash: </Col>
                <Col> {this.state.sellerBS['CashAccount']} </Col>
              </Row>
              <Row>
                <Col> AR: </Col>
                <Col> {this.state.sellerBS['ARAccount']} </Col>
              </Row>
              <Row>
                <Col> Inventory: </Col>
                <Col> {this.state.sellerBS['InventoryAccount']} </Col>
              </Row>
              <Row>
                <Col> CoGS: </Col>
                <Col> {this.state.sellerBS['CoGSAccount']} </Col>
              </Row>
              <Row>
                <Col> Sales: </Col>
                <Col> {this.state.sellerBS['SalesAccount']} </Col>
              </Row>
            </Col>
            <Col>
              <h4>Buyer</h4>
              <Form>
                <Form.Group className="mb-1">
                  <Form.Control placeholder="Address" onChange={(e) => this.setState({buyerAddress: e.target.value})}/>
                </Form.Group>
                <Button variant="info" type="submit" onClick={(e) => this.handleGetBalance(e, false) }>Get Balance Sheet</Button>
              </Form>
              <Row>
                <Col> Cash: </Col>
                <Col> {this.state.buyerBS['CashAccount']} </Col>
              </Row>
              <Row>
                <Col> AR: </Col>
                <Col> {this.state.buyerBS['ARAccount']} </Col>
              </Row>
              <Row>
                <Col> Inventory: </Col>
                <Col> {this.state.buyerBS['InventoryAccount']} </Col>
              </Row>
              <Row>
                <Col> CoGS: </Col>
                <Col> {this.state.buyerBS['CoGSAccount']} </Col>
              </Row>
              <Row>
                <Col> Sales: </Col>
                <Col> {this.state.buyerBS['SalesAccount']} </Col>
              </Row>
            </Col>
          </Row>
        </Container>
        <br></br>

        <Container>
          <Form>
            <Form.Label>Product info (*become a seller)</Form.Label>
            <Form.Group className="mb-1" controlId="formBasicItem">
              <Form.Control placeholder="Item to be sold" onChange={(e) => this.setState({itemSale: e.target.value}) }/>
            </Form.Group>
            <Form.Group className="mb-1" controlId="formBasicCost">
              <Form.Control placeholder="Cost" onChange={(e) => this.setState({costSale: e.target.value}) } />
            </Form.Group>
            <Form.Group className="mb-1" controlId="formBasicPrice" onChange={(e) => this.setState({priceSale: e.target.value}) } >
              <Form.Control placeholder="Price" />
            </Form.Group>
            <Button variant="primary" type="submit" onClick={(e) => this.handleSell(e) }>On sale</Button>
          </Form>
          <br />
          <Row>
            <Col>
              <h4>Real-time Product Status</h4>
              <Row>
                <Col>tx index:</Col>
                <Col>
                  <Form.Group className="mb-1" controlId="formBasicItem">
                    <Form.Control placeholder="index" onChange={(e) => this.setState({txid: e.target.value}) }/>
                  </Form.Group>
                  <Button variant="primary" type="submit" onClick={(e) => this.handleGetJournalEntry(e) }>Retrieve</Button>
                </Col>
              </Row>
              <Row>
                <Col> item: </Col>
                <Col> {this.state.item} </Col>
              </Row>
              <Row>
                <Col> cost: </Col>
                <Col> {this.state.cost} </Col>
              </Row>
              <Row>
                <Col> price: </Col>
                <Col> {this.state.price} </Col>
              </Row>
              <Row>
                <Col> buyer: </Col>
                <Col> {this.state.buyer} </Col>
              </Row>
              <Row>
                <Col> isBought: </Col>
                <Col> {this.state.isBought} </Col>
              </Row>
              <Row>
                <Col> isShipped: </Col>
                <Col> {this.state.isShipped} </Col>
              </Row>
              <Row>
                <Col> isReceived: </Col>
                <Col> {this.state.isReceived} </Col>
              </Row>
            </Col>
            <Col>
              <br />Buy this?
              <br />
              <Button variant="success" onClick={(e) => this.handleBuy(e) }>Buy</Button>
              <br />
              <br />Ship this? (*seller only)
              <br />
              <Button variant="primary" onClick={(e) => this.handleShip(e) }>Ship</Button>
              <br />
              <br />Receive this (*buyer only)
              <br />
              <Button variant="success" onClick={(e) => this.handleReceive(e) }>Receive</Button>
              <br />
              <br />
            </Col>
          </Row>
          <br />
          <br />
        </Container>
      </div>
    );
  }
}

export default App;
