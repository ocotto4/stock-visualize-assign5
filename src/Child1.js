import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      company: "Apple",
      selectedMonth: "November",
    };
    this.chartRef = React.createRef();
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.csv_data !== this.props.csv_data ||
      prevState.company !== this.state.company ||
      prevState.selectedMonth !== this.state.selectedMonth
    ) {
      this.renderChart();
    }
  }

  handleCompanyChange = (event) => {
    this.setState({ company: event.target.value });
  };

  handleMonthChange = (event) => {
    this.setState({ selectedMonth: event.target.value });
  };

  renderChart() {
    const { csv_data } = this.props;
    const { company, selectedMonth } = this.state;

    const filteredData = csv_data.filter(
      (d) =>
        d.Company === company &&
        d.Date.toLocaleString("default", { month: "long" }) === selectedMonth
    );

    const margin = { top: 20, right: 30, bottom: 60, left: 40 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(this.chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(this.chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(filteredData, (d) => d.Date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(filteredData, (d) => Math.min(d.Open, d.Close)), d3.max(filteredData, (d) => Math.max(d.Open, d.Close))])
      .nice()
      .range([height, 0]);

    const lineOpen = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Open))
      .curve(d3.curveCardinal);

    const lineClose = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Close))
      .curve(d3.curveCardinal);

    svg.append("g").call(d3.axisLeft(y));

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(d3.timeDay.every(1))); // makes sure the ticks match the data points

    xAxis
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(45)") //rotates text
      .style("font-size", "10px")
      .attr("dy", "1px")
      .attr("dx", "50px");

    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("class", "line-open")
      .attr("d", lineOpen);

    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("class", "line-close")
      .attr("d", lineClose);

    // puts circles on open line
    svg
      .selectAll("circle.open")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.Date))
      .attr("cy", (d) => y(d.Open))
      .attr("r", 3)
      .attr("class", "circle-open")
      .on("mouseover", (event, d) => {
        const tooltip = d3.select(".tooltip");
        tooltip
          .style("visibility", "visible")
          .html(
            `Date: ${d.Date.toLocaleDateString()}<br/>Open: ${d.Open.toFixed(2)}<br/>Close: ${d.Close.toFixed(2)}<br/>Diff: ${(d.Close - d.Open).toFixed(2)}`
          );
      })
      .on("mousemove", (event) => {
        d3.select(".tooltip")
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        d3.select(".tooltip").style("visibility", "hidden");
      });

    // puts circles on close line
    svg
      .selectAll("circle.close")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.Date))
      .attr("cy", (d) => y(d.Close))
      .attr("r", 3)
      .attr("class", "circle-close")
      .on("mouseover", (event, d) => {
        const tooltip = d3.select(".tooltip");
        tooltip
          .style("visibility", "visible")
          .html(
            `Date: ${d.Date.toLocaleDateString()}<br/>Open: ${d.Open.toFixed(2)}<br/>Close: ${d.Close.toFixed(2)}<br/>Diff: ${(d.Close - d.Open).toFixed(2)}`
          );
      })
      .on("mousemove", (event) => {
        d3.select(".tooltip")
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        d3.select(".tooltip").style("visibility", "hidden");
      });    
  }

  render() {
    const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <div className="child1">
        <div className="selectors">
          <div>
            <label>Company: </label>
            {options.map((opt) => (
              <label key={opt}>
                <input
                  type="radio"
                  value={opt}
                  checked={this.state.company === opt}
                  onChange={this.handleCompanyChange}
                />
                {opt}
              </label>
            ))}
          </div>
          <div>
            <label>Month: </label>
            <select value={this.state.selectedMonth} onChange={this.handleMonthChange}>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        
        <div className="chart-legend-container">
          <div ref={this.chartRef}></div>
          
          
          <div className="legend">
            <div className="legend-item">
              <div className="legend-open"></div>
              <span>Open</span>
            </div>
            <div className="legend-item">
              <div className="legend-close"></div>
              <span>Close</span>
            </div>
          </div>
        </div>
    
        <div className="tooltip" style={{ position: "absolute", visibility: "hidden" }}></div>
      </div>
    );
    
  }
}

export default Child1;
