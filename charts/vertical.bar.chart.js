let svg = null;
const chart_data = [
    {
        group: 'United States',
        series: [
            { name: 'Total population', value: 64 },
            { name: 'Infected population', value: 5 },
            { name: 'Safe population', value: 79 }
        ]
    },
    {
        group: 'India',
        series: [
            { name: 'Total population', value: 100 },
            { name: 'Infected population', value: 80 },
            { name: 'Safe population', value: 20 }
        ]
    },
    {
        group: 'China',
        series: [
            { name: 'Total population', value: 100 },
            { name: 'Infected population', value: 20 },
            { name: 'Safe population', value: 80 }
        ]
    }
];


// Bar Chart params (configurable)
const input_params = {
    height: 300,
    margin: { top: 10, left: 50, right: 10, bottom: 10 },
    xScaleLabelHeight: 25,
    innerPadding: 0.1,
    outerPadding: 0.1,
    seriesInnerPadding: 0.1,
    reduceBarWidth: 0,
    barColors: ['#00aeef', '#f98e2b', '#7C77AD'],
    yAxisLabel: 'No of Population',
};

const createChart = (chart_data) => {
    // create svg
    d3.select('svg').remove();
    svg = d3.select('#svg-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', input_params.height)
        .append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'vertical-bar-chart');


    // set left and right margin for the barchart container    
    const margin = {
        top: input_params.margin.top,
        right: input_params.margin.right,
        bottom: input_params.xScaleLabelHeight,
        left: input_params.margin.left
    };

    // Give some space for label before the yAxis so it does'nt get overlapped
    margin.left = input_params.yAxisLabel ? input_params.margin.left + 20 : margin.left

    // Get the actual Width of the container (Returns the dynamic width depends upon the screen resolution)
    const width = d3.select('#svg-container').node().getBoundingClientRect().width - margin.left - margin.right;
    let height = input_params.height - margin.top - margin.bottom;

    // prepare bar chart domain
    const prepareDomainBar = () => {
        let domain = null;
        if (input_params.domain) {
            domain = input_params.domain;
        } else {
            const bar_values = [].concat(...chart_data.map(item => item.series.map(j => j.value)));
            domain = [(d3.min(bar_values) > 0 ? 0 : d3.min(bar_values)), (d3.max(bar_values) * 1.01)];
        }
        input_params.domain = domain;
        return domain;
    }

    // Fetching the group from the data array to create x-axis
    const groups = chart_data.map(item => item.group);
    const xAxisGroupLabels = chart_data.length > 0 ? chart_data[0].series.map(item => item.name) : [];
    const domain = prepareDomainBar();

    // Setting up bandscale for spacing groups
    const getBandScale = (domain, range, innerPadding, outerPadding) => {
        const scale = d3.scaleBand()
            .range(range)
            .domain(domain)
            .paddingInner(input_params.innerPadding)
            .paddingOuter(input_params.outerPadding);
        // Naming it as a Scale of type BAND
        scale.type = 'BAND';
        return scale;
    }

    // Get bandscale
    const x0 = getBandScale(groups, [0, width], input_params.innerPadding, input_params.outerPadding).round(true);
    const x1 = getBandScale(xAxisGroupLabels, [0, x0.bandwidth()], input_params.seriesInnerPadding, input_params.outerPadding).round(true);

    // create chart group
    let chart = svg.selectAll('g.chart').data([{}]);
    chart = chart.enter()
        .append('g')
        .attr('class', 'chart')
        .merge(chart)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // create another chart group wrapper inside chart group (We may not be needing it but i like to be everything clean)
    let chartGroup = chart.selectAll('g.chart-wrapper').data([{}]);
    chartGroup = chartGroup.enter()
        .append('g')
        .attr('class', 'chart-wrapper')
        .merge(chartGroup)
        .attr('transform', 'translate(0, 0)');

    // Create X-AXIS
    const xAxisGroup = chartGroup.selectAll('g.x-axis').data([{}]);
    xAxisGroup.enter()
        .append('g')
        .attr('class', 'x-axis')
        .merge(xAxisGroup)
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x0))
        .selectAll('text')
        .style("text-anchor", "middle");

    // create bar group wrappers to create bars    
    let barGroupWrapper = chartGroup.selectAll('g.bar-group-wrapper').data([{}]);
    barGroupWrapper.exit().remove();
    barGroupWrapper = barGroupWrapper.enter()
        .append('g')
        .attr('class', 'bar-group-wrapper')
        .merge(barGroupWrapper);

    // create bar group
    let barGroup = barGroupWrapper.selectAll('g.bar-group').data(chart_data);
    const dataLength = chart_data[0].series.length;
    barGroup.exit().remove();
    barGroup = barGroup.enter()
        .append('g')
        .attr('class', 'bar-group')
        .merge(barGroup)
        .attr('transform', d => `translate(${input_params.reduceBarWidth ? (dataLength > 1
            ? input_params.reduceBarWidth / dataLength
            : input_params.reduceBarWidth * 1.5) : x0(d.group)}, 0)`);

    // Prepare Y-AXIS
    const y = d3.scaleLinear().domain(domain).nice().rangeRound([height, 0]);
    let yAxisGroup = chartGroup.selectAll('g.y-axis').data([{}]);
    yAxisGroup = yAxisGroup.enter()
        .append('g')
        .attr('class', 'y-axis')
        .merge(yAxisGroup)
        .call(d3.axisLeft(y));

    // yAxis Top Unit Text
    const axisUnitText = yAxisGroup.selectAll('text.axis-unit').data([{}]);
    axisUnitText.enter()
        .append('text')
        .attr('class', 'axis-unit')
        .merge(axisUnitText)
        .attr('x', 5)
        .attr('y', y(y.ticks().pop()))
        .attr('dy', '0.32rem')
        .attr('text-anchor', 'start')
        .style('fill', '#222')
        .text(input_params.yAxisLabel)

    // SET Y-AXIS LABEL        
    let yAxisLabelSelection = svg.selectAll('text.y-axis-label-temp').data([chart_data.yAxisLabel]);
    yAxisLabelSelection = yAxisLabelSelection.enter()
        .append('text')
        .attr('class', 'y-axis-label-temp')
        .attr('y', 10)
        .attr('x', -height / 2)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'middle')
        .merge(yAxisLabelSelection);
    yAxisLabelSelection.text(input_params.yAxisLabel);

    const barRects = barGroup.selectAll('rect.bar').data(d => d.series.map(item => item));
    barRects.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', x1.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('x', d => x1(d.name))
        .attr('y', d => y(d.value))
        .attr('fill', (d, i) => input_params.barColors[i]);
}
createChart(chart_data);
// Finally add the resize event which will redraw the chart if you reisze the browser to make it mobile responsive
window.addEventListener('resize', () => createChart(chart_data));
