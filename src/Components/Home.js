import React, { Component } from 'react';
import '../Styles/Home.css'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: new Date(),
      buyList: [],
      sellList: [],
      buyAvg: 0,
      sellAvg: 0
    }

    this.webSocket = new WebSocket('wss://ws-feed.pro.coinbase.com')
  }

  componentDidMount() {
    this.webSocketConnection();
    this.webSocketOnMessage();
    this.webSocketDisconnect();
  }

  // Connection
  webSocketConnection = () => {
    this.webSocket.onopen = () => {
      console.log('Connect');
      this.webSocket.send(JSON.stringify({
        type: "subscribe",
        product_ids: ["BTC-USD"],
        channels: ["full"]
      }))
    }
  }

  // Send and Recieve Message
  webSocketOnMessage = () => {
    this.webSocket.onmessage = (event) => {
      this.calculateData(JSON.parse(event.data));
    }
  }

  // disconnect
  webSocketDisconnect = () => {
    this.webSocket.onclose = () => {
      console.log('disconnect');

      // Reconnect
      this.webSocketConnection();
    }
  }

  calculateData = (data) => {
    var { time, buyList, sellList, buyAvg, sellAvg } = this.state;

    let startTime = new Date(time);
    let endTime = new Date(data.time);
    let seconds = (endTime.getTime() - startTime.getTime()) / 1000;

    if (seconds >= 5) {
      time = data.time;

      buyAvg = this.getAvg(buyList);
      sellAvg = this.getAvg(sellList);

      if (data.type === 'received') {
        if (data.side === 'buy') {
          buyList = [parseFloat(data.price)];
        }

        if (data.side === 'sell') {
          sellList = [parseFloat(data.price)];
        }
      }

    } else {
      if (data.type === 'received') {
        if (data.side === 'buy') {
          buyList.push(parseFloat(data.price));
        }

        if (data.side === 'sell') {
          sellList.push(parseFloat(data.price));
        }
      }
    }
    this.setState({ time, buyList, sellList, buyAvg, sellAvg })
  }

  // Calculate Average
  getAvg = (data) => {
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
  }

  render() {
    const { time, buyAvg, sellAvg } = this.state;
    return (
      <div className="home-container">
        <div >
          Time: {JSON.stringify(time)}
        </div>
        <div >
          Buy AVG: {buyAvg || 0}
        </div>
        <div >
          Sell AVG: {sellAvg || 0}
        </div>
      </div>
    );
  }
}



export default Home;