import {
  Component,
  h,
  State,
  Element,
  Prop,
  Watch,
  Listen,
} from "@stencil/core";

import { AV_API_KEY } from "../../global/global";

@Component({
  tag: "uc-stock-price",
  styleUrl: "stock-price.css",
  shadow: true,
})
export class StockPrice {
  stockInput: HTMLInputElement;

  @Element() el: HTMLElement;

  @State() fetchPrice: number;
  @State() stockUserInput: string;
  @State() stockInputValid: boolean;
  @State() error: string;
  @State() loading = true;

  @Prop({ mutable: true, reflectToAttr: true }) stockSymbol: string;

  @Watch("stockSymbol")
  stockSymbolChange(newVal: string, oldVal: string) {
    if (newVal !== oldVal) {
      this.stockUserInput = newVal;
      this.stockInputValid = true;
      this.fetchStockPrice(newVal);
    }
  }

  onFetchStockPrice = (event: Event) => {
    event.preventDefault();
    this.stockSymbol = this.stockInput.value;
  };

  componentWillLoad() {
    console.log("componentWillLoad");
    console.log(this.stockSymbol);
  }

  componentDidLoad() {
    console.log("componentDidLoad");
    if (this.stockSymbol) {
      this.stockUserInput = this.stockSymbol;
      this.stockInputValid = true;
      this.fetchStockPrice(this.stockSymbol);
    }
  }

  componentWillUpdate() {
    console.log("componentWillUpdate");
  }

  componentDidUpdate() {
    console.log("componentDidUpdate");
  }

  componentDidUnload() {
    console.log("componentDidUnload");
  }

  @Listen("ucSymbolSelected", { target: "body" })
  onStockSymbolSelected(event: CustomEvent) {
    if (event.detail && event.detail !== this.stockSymbol) {
      this.stockSymbol = event.detail;
    }
  }

  fetchStockPrice = (stockSymbol: string) => {
    this.loading = true;
    // taken from https://www.alphavantage.co/
    fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data["Global Quote"]["05. price"]) {
          throw new Error("Invalid Symbol!");
        }
        this.error = null;
        this.fetchPrice = +data["Global Quote"]["05. price"];
        this.loading = false;
      })
      .catch((err) => {
        this.error = err.message;
        this.fetchPrice = null;
        this.loading = false;
      });
  };

  hostData() {
    return { class: this.error ? "error" : "" };
  }

  onUserInput = (event: Event) => {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    if (this.stockUserInput.trim() !== "") {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  };

  render() {
    console.log("render");
    let dataContent = <p>Please enter a Symbol!</p>;
    if (this.error) {
      dataContent = <p>{this.error}</p>;
    }
    if (this.fetchPrice) {
      dataContent = <p>Price: ${this.fetchPrice}</p>;
    }
    if (this.loading) {
      dataContent = <uc-spinner />;
    }
    return [
      <form onSubmit={this.onFetchStockPrice}>
        <input
          id="stock-symbol"
          ref={(el) => (this.stockInput = el)}
          type="text"
          value={this.stockUserInput}
          onInput={this.onUserInput}
        />
        <button disabled={!this.stockInputValid || this.loading} type="submit">
          Fetch
        </button>
      </form>,
      <div>{dataContent}</div>,
    ];
  }
}
