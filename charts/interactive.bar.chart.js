let svg = null;
const data = [
    {
        group: 'Mango',
        series: [
            {label: 'Fresh', value: 10000, color: '#00d153'},
            {label: 'Ripe', value: 3000, color: '#006dee'},
            {label: 'Damaged', value: 2000, color: '#eeb100'},
            {label: 'Bought', value: 5000, color: '#f9006e'},
            {label: 'Sold', value: 8000, color: '#00c6ea'},
            {label: 'In Stock', value: 10000, color: '#006347'},
            {label: 'Reserved', value: 12000, color: '#f75100'}
        ]
    },
    {
        group: 'Banana',
        series: [
            {label: 'Fresh', value: 10000, color: '#00d153'},
            {label: 'Ripe', value: 3000, color: '#006dee'},
            {label: 'Damaged', value: 2000, color: '#eeb100'},
            {label: 'Bought', value: 5000, color: '#f9006e'},
            {label: 'Sold', value: 8000, color: '#00c6ea'},
            {label: 'In Stock', value: 10000, color: '#006347'},
            {label: 'Reserved', value: 12000, color: '#f75100'}
        ]
    },
    {
        group: 'Orange',
        series: [
            {label: 'Fresh', value: 10000, color: '#00d153'},
            {label: 'Ripe', value: 3000, color: '#006dee'},
            {label: 'Damaged', value: 2000, color: '#eeb100'},
            {label: 'Bought', value: 5000, color: '#f9006e'},
            {label: 'Sold', value: 8000, color: '#00c6ea'},
            {label: 'In Stock', value: 10000, color: '#006347'},
            {label: 'Reserved', value: 12000, color: '#f75100'}
        ]
    },
    {
        group: 'Licchi',
        series: [
            {label: 'Fresh', value: 10000, color: '#00d153'},
            {label: 'Ripe', value: 3000, color: '#006dee'},
            {label: 'Damaged', value: 2000, color: '#eeb100'},
            {label: 'Bought', value: 5000, color: '#f9006e'},
            {label: 'Sold', value: 8000, color: '#00c6ea'},
            {label: 'In Stock', value: 10000, color: '#006347'},
            {label: 'Reserved', value: 12000, color: '#f75100'}
        ]
    }
];

// Input Parameters
const INPUT_ATTRIBUTES = {
    height: 300,
    margin: {top: 10, left: 80, right: 10, bottom: 10},
    xAxisLabelHeight: 35,
    innerPadding: 0.1,
    outerPadding: 0.1,
    seriesInnerPadding: 0.1,
    reduceBarWidth: 0,
    yAxisLabel: 'No of Fruits',
    noOfTicks: 5,
    yAxisTickFormat: '$',
    domain: [0, 100000],
    rotationOffset: [0, 0],
    isRotateXAxisLabel: true,
    isChartWithNoAxis: false,
    isChartWithNoXAxis: false,
    xScaleLabelRotation: 0,
    xLabelStrokeColor: '#E1EAF2',
    isShowAlternateBackGroundColor: true,
    alternateBackgroundColorOpacity: 0.8,
    backgroundBarColorCodes: ['#E1EAF2', 'none'],
    showYAxisLabel: true,
    showBarValuesOnTop: true,
    showValuesBottomMargin: true
};

// InitToolTip
const barToolTip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const GET_ANGLES = {
    '0': {deg: 0, rad: 0, factor: 0},
    '-30': {deg: -30, rad: Math.PI / 6, factor: 1},
    '-60': {deg: -60, rad: Math.PI / 3, factor: 0.57},
    '-90': {deg: -90, rad: Math.PI / 2, factor: 0.5}
}

let isRendered = false;

// preparing a chart function
const createChart = (data) => {

    if (!isRendered) {
        svg = d3.select('#data-viz')
            .append('svg')
            .attr('width', '100%')
            .attr('height', INPUT_ATTRIBUTES.height)
            .append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'interactive-vertical-chart');
        isRendered = true;
    }

    // Setting up margins
    const margin = {
        top: INPUT_ATTRIBUTES.margin.top,
        right: INPUT_ATTRIBUTES.margin.right,
        bottom: INPUT_ATTRIBUTES.xAxisLabelHeight,
        left: INPUT_ATTRIBUTES.margin.left
    };

    // Bumping up a margin a little bit if there is yAxisLabel || you can set it to null if you donot need it
    margin.left = INPUT_ATTRIBUTES.yAxisLabel ? INPUT_ATTRIBUTES.margin.left + 20 : margin.left;

    // Returns the actual width of container based on the screen resolution or container width in pixel
    const width = d3.select('#data-viz').node().getBoundingClientRect().width - margin.left - margin.right;

    let height = INPUT_ATTRIBUTES.height - margin.top - margin.bottom;

    // Prepare domain of barchart or use the predefined domain
    const prepareDomain = () => {
        let domain;
        if (!INPUT_ATTRIBUTES.domain) {
            domain = INPUT_ATTRIBUTES.domain;
        } else {
            const values = [].concat(...data.map(item => item.series.map(j => j.value)));
            domain = [(d3.min(values) > 0 ? 0 : d3.min(values)), (d3.max(values) * 1.01)];
        }
        INPUT_ATTRIBUTES.domain = domain;
        return domain;
    }

    //fetching the group from the data array to create x-axis
    const groups = data.map(i => i.group);
    const xAxisGroupLabels = data.length > 0 ? data[0].series.map(i => i.label) : [];
    const domain = prepareDomain();

    // Prepare function get bandScale
    const prepareBandScale = (domain, range, innerPadding, outerPadding) => {
        const scale = d3.scaleBand()
            .range(range)
            .domain(domain)
            .paddingInner(innerPadding)
            .paddingOuter(outerPadding);

        scale.type = 'BAND';
        return scale;
    }

    // Get BandScales
    const x0 = prepareBandScale(groups, [0, width], INPUT_ATTRIBUTES.innerPadding, INPUT_ATTRIBUTES.outerPadding).round(true);
    const x1 = prepareBandScale(xAxisGroupLabels, [0, x0.bandwidth()], INPUT_ATTRIBUTES.seriesInnerPadding, INPUT_ATTRIBUTES.outerPadding).round(true);

    // creating chart groups
    let chart = svg.selectAll('g.chart').data([{}]);
    chart = chart.enter()
        .append('g')
        .attr('class', 'chart')
        .merge(chart)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Creating chart wrapper
    let chartGroup = chart.selectAll('g.chart-wrapper').data([{}]);
    chartGroup = chartGroup.enter()
        .append('g')
        .attr('class', 'chart-wrapper')
        .merge(chartGroup)
        .attr('transform', 'translate(0, 0)');

    // Get ticks value and bandWidth
    const getTicksValueAndBandWidth = (scale) => {
        const output = {ticks: [], bandwidth: 0, isBand: false};
        output.ticks = scale.domain();
        output.bandwidth = scale.bandwidth();
        output.isBand = true;
        return output;
    }

    // Creating x-Axis with rotating labels
    if (INPUT_ATTRIBUTES.isRotateXAxisLabel) {
        // Create X-AXIS
        const prepareXAxis = (xAxisGroup, xScale, offset, currentRotation, xAxisHeight = 15) => {
            const output = getTicksValueAndBandWidth(xScale);
            const maxTextLength = +d3.max(xAxisGroup.selectAll('.text_x-axis').nodes(), n => (n).getComputedTextLength());
            const xAxis = xAxisGroup.selectAll('.g_x-axis').data(output.ticks);
            xAxis.exit().remove();

            const newAxis = xAxis.enter()
                .append('g')
                .attr('class', 'g_x-axis');
            newAxis.append('rect')
                .attr('class', 'rect_x-axis')
                .attr('rx', 5)
                .attr('x', d => xScale(d))
                .attr('y', 0)
                .attr('width', output.bandwidth)
                .attr('height', xAxisHeight)
                .attr('fill', '#d3d3d3');

            newAxis.append('text')
                .attr('class', 'text_x-axis')
                .attr('y', xAxisHeight / 2 + 4)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .text(d => d)
                .style('font-weight', '600')
                .attr('fill', '#333');

            xAxis.select('.rect_x-axis').attr('x', d => currentRotation !== 0
                ? xScale(d) + (output.isBand ? output.bandwidth / 2 : 0) - offset * GET_ANGLES[offset[1]].factor
                : xScale(d) - (output.isBand ? 0 : output.bandwidth / 2))
                .attr('width', (maxTextLength > output.bandwidth ? maxTextLength : output.bandwidth));

            xAxis.select('.text_x-axis').attr('x', d => xScale(d) + (output.isBand ? output.bandwidth / 2 : 0))
                .text(d => d);
        }
        // Prepare X-AXIS and X-AIXS CONTENT ROTATION
        const prepareXAxisRotation = (chartGroup, x0, height) => {
            let xAxisGroup = chartGroup.selectAll('g.x-axis').data([{}]);
            xAxisGroup = xAxisGroup.enter()
                .append('g')
                .attr('class', 'x-axis')
                .merge(xAxisGroup)
                .attr('transform', `translate(0, ${(height + 10)})`);
            prepareXAxis(xAxisGroup, x0, INPUT_ATTRIBUTES.rotationOffset, INPUT_ATTRIBUTES.rotationOffset[1], 25);

            // Rotate X-AXIS Content if overflow
            const rotateXAxisContent = (container, xScale, previousRotationAngle) => {
                const output = getTicksValueAndBandWidth(xScale);
                const maxTextLength = +d3.max(container.selectAll('.text_x-axis').nodes(), n => n.getComputedTextLength());
                let textLength = maxTextLength;
                let angle = 0;
                while (textLength > output.bandwidth && angle > -90) {
                    angle -= 30;
                    textLength = Math.cos(angle * (Math.PI / 100) * textLength);
                }
                const sinShift = (maxTextLength * Math.abs(Math.sin(GET_ANGLES[angle].rad)));
                const cosShift = (maxTextLength * Math.abs(Math.cos(GET_ANGLES[angle].rad)));
                const pSinShift = (maxTextLength * Math.abs(Math.sin(GET_ANGLES[previousRotationAngle].rad)));
                container.each((d, index, nodes) => {
                    const translate = xScale(d) + output.bandwidth / 2;
                    const current = d3.select(nodes[index]);
                    const gBox = current.node().getBBox();
                    const factor = angle !== 0 ? -cosShift / 2 - gBox.height / 2 : 0;
                    const translateX = (1 - Math.cos(GET_ANGLES[angle].rad)) * translate + factor;
                    const translateY = (Math.sin(GET_ANGLES[angle].rad)) * translate - sinShift / 2;
                    const pTranslateX = (1 - Math.cos(GET_ANGLES[previousRotationAngle].rad)) * translate + factor;
                    const pTranslateY = (Math.sin(GET_ANGLES[previousRotationAngle].rad)) * translate - pSinShift / 2;
                    current.transition()
                        .duration(100)
                        .attrTween('transform', () => d3.interpolateString(`translate(${pTranslateX}, ${pTranslateY}) rotate(${previousRotationAngle}`, `translate(${translateX}, ${translateY}) rotate(${angle})`));
                });
                return [sinShift, angle];
            }

            const rotationOffset = rotateXAxisContent(xAxisGroup.selectAll('.g_x-axis'), x0, INPUT_ATTRIBUTES.rotationOffset[1]);
            height = height - (isNaN(rotationOffset[0]) ? 0 : INPUT_ATTRIBUTES.rotationOffset[0]);
            prepareXAxis(xAxisGroup, x0, rotationOffset, rotationOffset[1]);
            return height;
        }
        height = prepareXAxisRotation(chartGroup, x0, height);
    } else {
        if (!this.isChartWithNoAxis && !this.isChartWithNoAxis) {
            const createXAxis = (chartGroup, x0, height) => {

                const wrapTickText = (tickTexts, width) => {
                    tickTexts.each((datum, index, nodes) => {
                        const tickText = d3.select(nodes[index]);
                        const words = tickText.text().split(/\s+/).reverse();
                        const tickTextY = tickText.attr('y');
                        const tickTextDy = parseFloat(tickText.attr('dy'));
                        const tickTextX = parseFloat(tickText.attr('x') || 0);
                        const lineHeight = 1.1;
                        tickText.text(null);
                        const word = 0;
                        let lineNum = 0;
                        let tspan = tickText.append('span')
                            .attr('x', tickTextX)
                            .attr('y', tickTextY)
                            .attr('dy', tickTextDy + 'em');
                        while (words.pop()) {
                            const tspanText = tspan.text() || '';
                            tspan.text(tspanText.concat(' ' + word));
                            if (tspan.node().getBoundingClientRect() > width) {
                                tspan.text(tspanText);
                                tspan = tickText.append('tspan')
                                    .attr('x', tickTextX)
                                    .attr('y', tickTextY)
                                    .attr('dy', `${++lineNum * lineHeight + tickTextDy}em`)
                                    .text(word);
                            }
                        }
                    });
                }

                const xAxisGroup = chartGroup.selectAll('g.x-axis').data([{}]);
                const tickTexts = xAxisGroup.enter().append('g')
                    .attr('class', 'x-axis')
                    .merge(xAxisGroup)
                    .attr('transform', `translate(0, ${height})`)
                    .call(d3.axisBottom(x0))
                    .selectAll('g.tick text')
                    .call(wrapTickText, x0.bandwidth())
                if (INPUT_ATTRIBUTES.xScaleLabelRotation) {
                    tickTexts.attr('text-anchor', 'end')
                        .attr('dx', '-.8em')
                        .attr('dy', '.-15em')
                        .attr('transform', `rotate(${INPUT_ATTRIBUTES.xScaleLabelRotation})`)
                }
            }
            createXAxis(chartGroup, x0, height);
            const createXAxisRects = () => {
                d3.selectAll('.x.tick').each((datum, index, nodes) => {
                    const tick = d3.select(nodes[index]);
                    const tickTextBBox = tick.select('text').node().getBBox();
                    const tickRect = tick.selectAll('rect').data([{}]);
                    tickRect.enter()
                        .insert('rect', ':first-child')
                        .attr('rx', 5)
                        .attr('ry', 5)
                        .attr('x', tickTextBBox.x - 3)
                        .attr('y', tickTextBBox.height)
                        .attr('height', tickTextBBox.width + 10)
                        .attr('width', tickTextBBox.width + 10)
                        .attr('fill', INPUT_ATTRIBUTES.xLabelStrokeColor)
                        .attr('transform', `rotate(${INPUT_ATTRIBUTES.xScaleLabelRotation})`);
                });
            }
            createXAxisRects();
        }
    }

    const y = d3.scaleLinear().domain(domain).rangeRound([height, 0]);
    if (INPUT_ATTRIBUTES.isShowAlternateBackGroundColor) {
        const createBackGroundBar = (container, xScale, yScale, backgroundBarColorCodes) => {
            const output = getTicksValueAndBandWidth(xScale);
            const bars = container.selectAll('.rect_background-bar')
                .data(output.ticks);
            bars.exit().remove();
            bars.enter()
                .append('rect')
                .attr('class', 'rect_background-bar')
                .attr('x', (d) => xScale(d) - (!output.isBand ? output.bandwidth / 2 : 0))
                .attr('y', 0)
                .attr('height', yScale.range()[0])
                .attr('width', output.bandwidth)
                .attr('fill', (d, i) => i % 2 ? backgroundBarColorCodes[0] : backgroundBarColorCodes[1])
                .attr('opacity', () => INPUT_ATTRIBUTES.alternateBackgroundColorOpacity)
                .merge(bars)
                .transition(d3.transition(null).duration(200).ease(d3.easeLinear))
                .attr('x', (d) => xScale(d) - (!output.isBand ? output.bandwidth / 2 : 0))
                .attr('height', yScale.range()[0])
                .attr('width', output.bandwidth)
                .attr('fill', (d, i) => i % 2 ? backgroundBarColorCodes[0] : backgroundBarColorCodes[1]);
        }

        let backBackGroundWrapper = chartGroup.selectAll('g.bar-background-wrapper').data([{}]);
        backBackGroundWrapper = backBackGroundWrapper.enter()
            .append('g')
            .merge(backBackGroundWrapper)
            .attr('class', 'bar-background-wrapper');
        createBackGroundBar(backBackGroundWrapper, x0, y, INPUT_ATTRIBUTES.backgroundBarColorCodes);
    }

    // Create Grid Line Group
    const getFormattedTickValues = (yScale, noOfTicks, additionalTicks = 0) => {
        const step = (yScale.domain()[1] - yScale.domain()[0]) / noOfTicks;
        return d3.range(yScale.domain()[0], yScale.domain()[1] + step / 2 + additionalTicks * step, step);
    }
    if (!INPUT_ATTRIBUTES.isChartWithNoAxis) {
        let gridLineGroup = chartGroup.selectAll('g.grid-line-group').data([{}]);
        const formattedRange = getFormattedTickValues(y, INPUT_ATTRIBUTES.noOfTicks);
        let axis = d3.axisLeft(y).tickSize(-width).tickFormat(() => '').ticks(INPUT_ATTRIBUTES.noOfTicks);
        if (INPUT_ATTRIBUTES.noOfTicks) {
            axis = axis.tickValues([...formattedRange]);
        }
        gridLineGroup = gridLineGroup.enter()
            .append('g')
            .attr('class', 'grid-line-group')
            .merge(gridLineGroup)
            //.call(axis);
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .ticks(INPUT_ATTRIBUTES.noOfTicks)
                .tickFormat(() => ''));
        gridLineGroup.selectAll('line').attr('stroke', '#d3d3d3');
        gridLineGroup.selectAll('path.domain').remove();
    }

    let barGroupWrapper = chartGroup.selectAll('g.bar-group-wrapper').data([1]);
    barGroupWrapper.exit().remove();
    barGroupWrapper = barGroupWrapper.enter()
        .append('g')
        .merge(barGroupWrapper)
        .attr('class', 'bar-group-wrapper');

    // Create Bar Group
    let barGroup = barGroupWrapper.selectAll('g.bar-group').data(data);
    const dataLength = data[0].series.length;
    barGroup.exit().remove();
    barGroup = barGroup.enter()
        .append('g')
        .attr('class', 'bar-group')
        .merge(barGroup)
        .attr('transform', d => `translate(${INPUT_ATTRIBUTES.reduceBarWidth ? (dataLength > 1
            ? INPUT_ATTRIBUTES.reduceBarWidth / dataLength
            : INPUT_ATTRIBUTES.reduceBarWidth * 1.5) : x0(d.group)}, 0)`);
    // Start creating bar rectangles.
    const createBarRects = (barGroup, x1, y, height) => {
        const barRects = barGroup.selectAll('rect.bar').data(d => d.series.map(i => i));
        d3.selectAll('.d3-tip').remove();
        barRects.enter()
            .append('rect')
            .attr('width', x1.bandwidth())
            .attr('x', d => x1(d.label))
            .attr('y', height)
            .attr('stroke', d => d.selected ? '#0079a7' : null)
            .attr('height', 0)
            .attr('stroke-width', 5)
            .attr('fill', d => d.color)
            .merge(barRects)
            .attr('class', 'bar')
            .on('mouseover', ($event, d) => {
                barToolTip.transition()
                    .duration(200)
                    .style("opacity", .9);
                barToolTip.html(d.label + "<br/>" + d.value)
                    .style("left", ($event.pageX) + "px")
                    .style("top", ($event.pageY - 28) + "px");
            })
            .on('mouseout', () => barToolTip.transition().duration(500).style("opacity", 0))
            .on('click', d => console.log(d))
            .transition().duration(1000 * 1.2)
            .attr('width', x1.bandwidth())
            .attr('x', d => x1(d.label))
            .attr('y', d => y(Math.max(0, d.value)))
            .attr('height', d => INPUT_ATTRIBUTES.isChartWithNoAxis ? (y(0) - y(d.value)) - 15 : (y(0) - y(d.value)))
            .attr('fill', d => d.color);

        barRects.exit()
            .transition().duration(1000 * 1.2)
            .attr('y', height)
            .attr('width', 0)
            .attr('height', 0)
            .remove();

    }
    createBarRects(barGroup, x1, y, height);
    const createBarLabels = () => {
        if (INPUT_ATTRIBUTES.showBarValuesOnTop) {
            const barTexts = barGroup.selectAll('text.bar-label').data(d => d.series);
            const enterBarText = barTexts.enter()
                .append('text')
                .attr('class', 'bar-label')
                .attr('text-anchor', 'middle')
                .attr('x', (s) => x1(s.label) + x1.bandwidth() / 2)
                .attr('y', () => height - (INPUT_ATTRIBUTES.showValuesBottomMargin ? INPUT_ATTRIBUTES.showValuesBottomMargin : 3))
                .attr('font-size', '8px')
                .style('opacity', 0)
                .merge(barTexts)
                .text(d => d.value);

            let hideValue = false;
            enterBarText.each((d, i, nodes) => {
                const text = nodes[i];
                if (x1.bandwidth() - 10 < text.getComputedTextLength()) {
                    hideValue = true;
                }
            });
            enterBarText.each((d, i, nodes) => {
                const text = nodes[i];
                if (hideValue) {
                    text.textContent = '';
                }
            });
            enterBarText.transition().duration(1000 * 1.2)
                .attr('x', (s, i, series) => {
                    return x1(s.label) + x1.bandwidth() / 2 - (series?.length > 1 ? (!i ? 0 : INPUT_ATTRIBUTES.reduceBarWidth) : INPUT_ATTRIBUTES.reduceBarWidth * 1.5);
                }).attr('y', (d) => y(d.value) - (INPUT_ATTRIBUTES.showValuesBottomMargin ? INPUT_ATTRIBUTES.showValuesBottomMargin : 3))
                .style('opacity', 1);
            barTexts.exit()
                .transition().duration(1000 * 1.2)
                .attr('y', () => height - (INPUT_ATTRIBUTES.showValuesBottomMargin ? INPUT_ATTRIBUTES.showValuesBottomMargin : 3))
                .style('opacity', 0)
                .remove();
        }
    }
    createBarLabels(barGroup, x1, y, height);
    if (!INPUT_ATTRIBUTES.isChartWithNoAxis) {
        const getTickFormat = (yAxisTickFormat) => {
            if (yAxisTickFormat === '%') {
                return d => d3.format('0.%')(+d);
            }
            return d => '$' + d;
        }
        const createYAxis = (chartGroup, y) => {
            const tickFormat = getTickFormat(INPUT_ATTRIBUTES.yAxisTickFormat)
            let yAxisGroup = chartGroup.selectAll('g.y-axis').data([{}]);
            const formattedRange = getFormattedTickValues(y, INPUT_ATTRIBUTES.noOfTicks);
            let axis = d3.axisLeft(y)
                .tickFormat(tickFormat)
                .ticks(INPUT_ATTRIBUTES.noOfTicks);
            if (this.ticks) {
                axis = axis.tickValues([...formattedRange]);
            }
            yAxisGroup = yAxisGroup.enter()
                .append('g')
                .attr('class', 'y-axis')
                .merge(yAxisGroup)
                .call(axis);
                // .call(d3.axisLeft(y)
                //     .tickFormat(tickFormat)
                //     .ticks(INPUT_ATTRIBUTES.ticks)
                // );
            yAxisGroup.selectAll('path.domain').remove();
            yAxisGroup.selectAll('.tick').select('line').remove();
            if (INPUT_ATTRIBUTES.showYAxisLabel) {
                const axisUnitText = yAxisGroup.selectAll('text.axis-unit').data([{}]);
                axisUnitText.enter()
                    .append('text')
                    .merge(axisUnitText)
                    .attr('x', 0)
                    .attr('y', y(y.ticks().pop()))
                    .attr('dy', '0.32em')
                    .attr('class', 'axis-unit')
                    .attr('text-anchor', 'start')
                    .text(INPUT_ATTRIBUTES.showYAxisLabel);
            } else {
                yAxisGroup.selectAll().data([]).exit().remove();
            }
        }
        if (!INPUT_ATTRIBUTES.isChartWithNoAxis) {
            createYAxis(chartGroup, y);
        }
        if (INPUT_ATTRIBUTES.yAxisLabel) {
            const prepareYAxisLabel = (height) => {
                let yAxisLabelSelection = svg.selectAll('text.y-axis-label-temp').data([{}]);
                yAxisLabelSelection = yAxisLabelSelection.enter()
                    .append('text')
                    .attr('class', 'y-axis-label-temp')
                    .attr('y', 10)
                    .attr('x', -height / 2)
                    .attr('dy', '1em')
                    .attr('transform', 'rotate(-90)')
                    .style('text-anchor', 'middle')
                    .merge(yAxisLabelSelection)
                yAxisLabelSelection.text(INPUT_ATTRIBUTES.yAxisLabel);
            }
            prepareYAxisLabel(height);
        }
    }
}
createChart(data);
window.addEventListener('resize', () => createChart(data));
