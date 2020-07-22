import { Component, h, State, Event, EventEmitter } from "@stencil/core";

import { AV_API_KEY } from "../../global/global";

@Component({
  tag: "uc-stock-finder",
  styleUrl: "stock-finder.css",
  shadow: true,
})
export class StockFinder {
  stockNameInput: HTMLInputElement;

  @State() searchResults: { symbol: string; name: string }[] = [];
  @State() loading = false;

  @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<
    string
  >;

  onFindStocks(event: Event) {
    event.preventDefault();
    this.loading = true;
    const stockName = this.stockNameInput.value;
    fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        this.searchResults = data["bestMatches"].map((match) => {
          return { name: match["2. name"], symbol: match["1. symbol"] };
        });
        console.log(this.searchResults);
        this.loading = false;
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
      });
  }

  onSymbolSelected = (symbol: string) => {
    this.ucSymbolSelected.emit(symbol);
  };

  render() {
    let content = (
      <ul>
        {this.searchResults.map((result) => (
          <li onClick={() => this.onSymbolSelected(result.symbol)}>
            <strong>{result.symbol}</strong> - {result.name}
          </li>
        ))}
      </ul>
    );
    if (this.loading) {
      content = <uc-spinner />;
    }
    return [
      <form onSubmit={this.onFindStocks.bind(this)}>
        <input id="stock-symbol" ref={(el) => (this.stockNameInput = el)} />
        <button type="submit">Find!</button>
      </form>,
      content,
    ];
  }
}
