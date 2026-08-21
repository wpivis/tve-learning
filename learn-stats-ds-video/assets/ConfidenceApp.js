(function(){
  // Parse URL parameters for custom labels (LaTeX notation)
  const urlParams = new URLSearchParams(window.location.search);
  const labelsParam = urlParams.get('labels');
  
  // Parse optional beta, se, and b from URL
  const urlBeta = urlParams.get('beta');
  const urlSE = urlParams.get('se');
  const urlB = urlParams.get('b');
  
  // Parse display mode parameters
  const urlHistogram = urlParams.get('histogram');
  const urlCurve = urlParams.get('curve');
  const urlCI = urlParams.get('ci');
  const urlAlpha = urlParams.get('alpha');
  const urlSecondDist = urlParams.get('seconddist');
  const urlPowerMode = urlParams.get('powermode');
  const urlVertLines = urlParams.get('vertlines');
  const urlPValue = urlParams.get('pvalue');
  const urlDf = urlParams.get('df');
  const urlN = urlParams.get('n');
  const urlScale = urlParams.get('scale');
  const urlBins = urlParams.get('bins');
  
  // Parse color parameters
  const urlMainColor = urlParams.get('main_color');
  const urlAlphaColor = urlParams.get('alpha_color');
  const urlPColor = urlParams.get('p_color');
  const urlSecondaryColor = urlParams.get('secondary_color');
  const urlPowerColor = urlParams.get('power_color');
  const urlType2Color = urlParams.get('type2_color');
  
  
  // Parse hide parameters
  const hideSimulate = urlParams.get('hide_simulate') === null ? true : urlParams.get('hide_simulate') === 'true';
  const hideBeta = urlParams.get('hide_beta') === 'true';
  const hideSE = urlParams.get('hide_se') === 'true';
  const hideN = urlParams.get('hide_n') === 'true';
  const hideScale = urlParams.get('hide_scale') === 'true';
  const hideBins = urlParams.get('hide_bins') === 'true';
  const hideCurve = urlParams.get('hide_curve') === 'true';
  const hideDf = urlParams.get('hide_df') === 'true';
  const hideCI = urlParams.get('hide_ci') === 'true';
  const hideVertLines = urlParams.get('hide_vertlines') === 'true';
  const hideHistogram = urlParams.get('hide_histogram') === 'true';
  const hideSecondDist = urlParams.get('hide_seconddist') === 'true' || urlParams.get('hide_seconddist') === 'TRUE';
  const hideThirdDist = urlParams.get('hide_thirddist') === 'true' || urlParams.get('hide_thirddist') === 'TRUE';
  const hidePowerSeg = urlParams.get('hide_powermode') === 'true';
  const hideBInput = urlParams.get('hide_b') === 'true';
  const hideP = urlParams.get('hide_p') === 'true' || urlParams.get('hide_p') === 'TRUE';
  
  // Apply color overrides if specified
  function applyColorOverrides() {
    const customStyles = [];
    
    if(urlMainColor) {
      customStyles.push(`.hist-bar { fill: ${getMainFill()} !important; stroke: ${getMainStroke()} !important; }`);
      customStyles.push(`.curve { stroke: ${getMainStroke()} !important; }`);
    }
    
    if(urlAlphaColor) {
      customStyles.push(`.tail-area { fill: ${urlAlphaColor} !important; }`);
      customStyles.push(`.hist-shade { fill: ${urlAlphaColor} !important; }`);
    }
    
    if(urlPColor) {
      customStyles.push(`.p-area { fill: ${urlPColor} !important; }`);
      customStyles.push(`.hist-shade-p { fill: ${urlPColor} !important; }`);
    }
    
    if(urlSecondaryColor) {
      customStyles.push(`.curve-second { stroke: ${getSecondaryStroke()} !important; }`);
      customStyles.push(`.curve-third { stroke: ${getSecondaryStroke()} !important; }`);
    }
    
    if(urlPowerColor) {
      customStyles.push(`.power-area { fill: ${urlPowerColor} !important; }`);
    }
    
    if(urlType2Color) {
      customStyles.push(`.type2-area { fill: ${urlType2Color} !important; }`);
      // Alpha regions in secondary distribution should use Type II error color
      customStyles.push(`.tail-area-orange { fill: ${getSecondaryAlpha()} !important; }`);
      customStyles.push(`.tail-area-orange-alt { fill: ${getSecondaryAlpha()} !important; }`);
      customStyles.push(`.hist-shade-2 { fill: ${getSecondaryAlpha()} !important; }`);
      customStyles.push(`.hist-shade-3 { fill: ${getSecondaryAlpha()} !important; }`);
    }
    
    if(customStyles.length > 0) {
      const styleElement = document.createElement('style');
      styleElement.textContent = customStyles.join('\n');
      document.head.appendChild(styleElement);
    }
  }
  
  applyColorOverrides();
  
  // Color helper functions for dynamic styling
  function darkenColor(hex, amount = 0.3) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex color
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);  
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Darken by reducing RGB values
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    
    // Convert back to hex
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }
  
  function getMainColor() { return urlMainColor || '#60a5fa'; }
  function getMainFill() { 
    const baseColor = getMainColor();
    return baseColor.length === 9 ? baseColor : baseColor + '55';
  }
  function getMainStroke() { 
    const baseColor = getMainColor();
    // Remove opacity suffix if present, then darken
    const cleanColor = baseColor.length === 9 ? baseColor.slice(0, 7) : baseColor;
    return darkenColor(cleanColor, 0.4);
  }
  function getAlphaColor() { return urlAlphaColor || '#1e3a8a44'; }
  function getPColor() { return urlPColor || '#3b82f6'; }
  function getSecondaryColor() { return urlSecondaryColor || '#f97316'; }
  function getSecondaryFill() { 
    const baseColor = getSecondaryColor();
    return baseColor.length === 9 ? baseColor.slice(0, -2) + '55' : baseColor + '55';
  }
  function getSecondaryAlpha() { 
    const baseColor = getType2Color();  // Use Type II error color for alpha regions in secondary distribution
    return baseColor.length === 9 ? baseColor.slice(0, -2) + '44' : baseColor + '44';
  }
  function getSecondaryStroke() { 
    const baseColor = getSecondaryColor();
    const cleanColor = baseColor.length === 9 ? baseColor.slice(0, 7) : baseColor;
    return darkenColor(cleanColor, 0.4);
  }
  function getPowerColor() { return urlPowerColor || '#e67e22'; }
  function getType2Color() { return urlType2Color || '#fbbf24'; }
  
  // Default labels (LaTeX strings)
  let labelParamLatex = '\\beta';           // Population parameter (top marker)
  let labelSampleStatLatex = 'b';           // Sample statistic (bottom marker)
  let labelSamplingMeanLatex = '\\bar{b}';  // Mean of sampling distribution (mean line)
  
  if(labelsParam){
    const parts = labelsParam.split(',').map(s => s.trim());
    if(parts.length >= 1) labelParamLatex = stripDollars(parts[0]);
    if(parts.length >= 2) labelSampleStatLatex = stripDollars(parts[1]);
    if(parts.length >= 3) labelSamplingMeanLatex = stripDollars(parts[2]);
  }
  
  function stripDollars(str){
    return str.replace(/^\$+|\$+$/g, '');
  }
  
  // Render LaTeX to HTML string
  function renderLatex(latex){
    try {
      if(typeof katex === 'undefined') {
        return latex;
      }
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false
      });
    } catch(e) {
      return latex;
    }
  }
  
  const chartWrap = document.getElementById('chart');
  let nValue = 1; // Number of draws per simulation click
  let currentN = 0; // Current total number of samples accumulated
  let isLockedToBeta = false; // Tracks if sample mean has locked to beta
  const binsRange = document.getElementById('binsRange');
  const betaInput = document.getElementById('betaInput');
  const betaBtn = document.getElementById('betaBtn');
  const seInput = document.getElementById('seInput');
  const seRange = document.getElementById('seRange');
  const scaleRange = document.getElementById('scaleRange');
  const ciSeg = document.getElementById('ciSeg');
  const bInput = document.getElementById('bInput');
  const bBtn = document.getElementById('bBtn');
  
  // Update buttons immediately
  if(betaBtn) {
    betaBtn.innerHTML = 'Update ' + renderLatex(labelParamLatex);
    betaBtn.style.visibility = 'visible';
  }
  if(bBtn) {
    bBtn.innerHTML = 'Update ' + renderLatex(labelSampleStatLatex);
    bBtn.style.visibility = 'visible';
  }
  const regenBtn = document.getElementById('regenBtn');
  const curveSeg = document.getElementById('curveSeg');
  const dfInput  = document.getElementById('dfInput');
  const btnMarkBound = document.getElementById('btnMarkBound');
  const btnMarkBound2 = document.getElementById('btnMarkBound2');
  const btnMarkBound3 = document.getElementById('btnMarkBound3');
  const secondDistBtn = document.getElementById('secondDistBtn');
  const thirdDistBtn = document.getElementById('thirdDistBtn');
  if(secondDistBtn) secondDistBtn.querySelector('span').innerHTML = renderLatex('{' + labelParamLatex + "}'" );
  if(thirdDistBtn) thirdDistBtn.querySelector('span').innerHTML = renderLatex('{' + labelParamLatex + "}''");
  const seLabel = document.getElementById('seLabel');
  if(seLabel) seLabel.innerHTML = renderLatex('SE_{' + labelSampleStatLatex + '}');
  const powerSeg = document.getElementById('powerSeg');
  const vertLinesBtn = document.getElementById('vertLinesBtn');
  const histogramBtn = document.getElementById('histogramBtn');
  const pValueBtn = document.getElementById('pValueBtn');
  const legendEl = document.getElementById('legend');

  let width = chartWrap.clientWidth, height = chartWrap.clientHeight;
  let margin = {top:56, right:20, bottom:116, left:44};
  let innerW = width - margin.left - margin.right;
  let innerH = height - margin.top - margin.bottom;
  const axisInsetTop = 12;
  const axisInsetBottom = 14;
  let plotH = Math.max(1, innerH - axisInsetTop - axisInsetBottom);

  const svg = d3.select('#chart').append('svg').attr('width',width).attr('height',height);

  // Arrowheads
  const defs = svg.append('defs');
  defs.append('marker').attr('id','arrowUpRed').attr('markerWidth',10).attr('markerHeight',8)
    .attr('refX',8).attr('refY',4).attr('orient','auto')
    .append('path').attr('d','M0,0 L8,4 L0,8 Z').attr('fill','#ef4444');
  defs.append('marker').attr('id','arrowDownRed').attr('markerWidth',10).attr('markerHeight',8)
    .attr('refX',8).attr('refY',4).attr('orient','auto')
    .append('path').attr('d','M0,8 L8,4 L0,0 Z').attr('fill','#ef4444');
  defs.append('marker').attr('id','arrowDownBlue').attr('markerWidth',10).attr('markerHeight',8)
    .attr('refX',8).attr('refY',4).attr('orient','auto')
    .append('path').attr('d','M0,8 L8,4 L0,0 Z').attr('fill','#1d4ed8');
  defs.append('marker').attr('id','arrowDownOrange').attr('markerWidth',10).attr('markerHeight',8)
    .attr('refX',8).attr('refY',4).attr('orient','auto')
    .append('path').attr('d','M0,8 L8,4 L0,0 Z').attr('fill','#f97316');

  const root = svg.append('g').attr('transform','translate('+margin.left+','+margin.top+')');

  // Axes
  const xAxisTopG = root.append('g').attr('class','axis x');
  const xAxisG    = root.append('g').attr('class','axis x');

  // Plot area (shifts when dragging)
  const plotWrap = root.append('g');
  const histWrap = plotWrap.append('g').attr('class','hist-wrap');
  const histG    = histWrap.append('g').attr('class','hist');
  const histShadeG = histWrap.append('g').attr('class','hist-shade-wrap');
  const histShadePG = histWrap.append('g').attr('class','hist-shade-p-wrap');
  // Alpha cutoff arrow markers (shown when curve is off but histogram alpha shading is on)
  const alphaCutoffArrowL = histWrap.append('line').attr('stroke','#1e3a8a').attr('stroke-width',2).attr('marker-end','url(#arrowDownBlue)').style('display','none');
  const alphaCutoffArrowR = histWrap.append('line').attr('stroke','#1e3a8a').attr('stroke-width',2).attr('marker-end','url(#arrowDownBlue)').style('display','none');
  const meanLineBg = histWrap.append('line').attr('class','mean-line-bg').attr('stroke','#fff').attr('stroke-width',3);
  const meanLine = histWrap.append('line').attr('class','mean-line');
  const meanLabel = histWrap.append('g').attr('class','mean-label');
  meanLabel.append('rect')
    .attr('fill','#fff').attr('opacity',0.75).attr('rx',3).attr('ry',3);
  const meanLabelFO = meanLabel.append('foreignObject');
  meanLabel.style('display','none');

  // Second distribution
  const secondWrap = plotWrap.append('g').attr('class','second-wrap');
  const histG2 = secondWrap.append('g').attr('class','hist-2');
  const histShadeG2 = secondWrap.append('g').attr('class','hist-shade-wrap-2');
  const meanLine2Bg = secondWrap.append('line').attr('class','mean-line-bg').attr('stroke','#fff').attr('stroke-width',3).style('display','none');
  const meanLine2 = secondWrap.append('line').attr('class','mean-line-orange').style('display','none');
  const meanLabel2 = secondWrap.append('g').attr('class','mean-label-orange');
  meanLabel2.append('rect')
    .attr('fill','#fff').attr('opacity',0.75).attr('rx',3).attr('ry',3);
  const meanLabelFO2 = meanLabel2.append('foreignObject');
  meanLabel2.style('display','none');
  
  // Overlay (curve + tails) for main distribution
  const overlayG = histWrap.append('g').attr('class','overlay');
  const curvePath = overlayG.append('path').attr('class','curve').style('display','none');
  const tailLineL = overlayG.append('line').attr('class','tail-line').style('display','none');
  const tailLineR = overlayG.append('line').attr('class','tail-line').style('display','none');
  const tailAreaL = overlayG.append('path').attr('class','tail-area').style('display','none');
  const tailAreaR = overlayG.append('path').attr('class','tail-area').style('display','none');
  
  // Vertical CI lines
  const vertLineL = histWrap.append('line').attr('stroke','#1d4ed8').attr('stroke-width',2).attr('stroke-dasharray','4,4').style('display','none');
  const vertLineR = histWrap.append('line').attr('stroke','#1d4ed8').attr('stroke-width',2).attr('stroke-dasharray','4,4').style('display','none');
  
  // Second distribution overlays
  const overlayG2 = secondWrap.append('g').attr('class','overlay2');
  const curvePath2 = overlayG2.append('path').attr('class','curve-second').style('display','none');
  const tailLineL2 = overlayG2.append('line').attr('class','tail-line-orange').style('display','none');
  const tailLineR2 = overlayG2.append('line').attr('class','tail-line-orange').style('display','none');
  const tailAreaL2 = overlayG2.append('path').attr('class','tail-area-orange').style('display','none');
  const tailAreaR2 = overlayG2.append('path').attr('class','tail-area-orange').style('display','none');
  
  // Power analysis areas
  const powerAreaL = overlayG2.append('path').attr('class','power-area').style('display','none');
  const powerAreaR = overlayG2.append('path').attr('class','power-area').style('display','none');
  const type2Area = overlayG2.append('path').attr('class','type2-area').style('display','none');

  // Third distribution (orange)
  const thirdWrap = plotWrap.append('g').attr('class','third-wrap');
  const histG3 = thirdWrap.append('g').attr('class','hist-3');
  const histShadeG3 = thirdWrap.append('g').attr('class','hist-shade-wrap-3');
  const meanLine3Bg = thirdWrap.append('line').attr('class','mean-line-bg').attr('stroke','#fff').attr('stroke-width',3).style('display','none');
  const meanLine3 = thirdWrap.append('line').attr('class','mean-line').style('stroke','#f97316').style('display','none');
  const meanLabel3 = thirdWrap.append('g').attr('class','mean-label-orange');
  meanLabel3.append('rect')
    .attr('fill','#fff').attr('opacity',0.75).attr('rx',3).attr('ry',3);
  const meanLabelFO3 = meanLabel3.append('foreignObject');
  meanLabel3.style('display','none');
  
  // Third distribution overlays
  const overlayG3 = thirdWrap.append('g').attr('class','overlay3');
  const curvePath3 = overlayG3.append('path').attr('class','curve-third').style('display','none');
  const tailLineL3 = overlayG3.append('line').attr('class','tail-line-orange-alt').style('display','none');
  const tailLineR3 = overlayG3.append('line').attr('class','tail-line-orange-alt').style('display','none');
  const tailAreaL3 = overlayG3.append('path').attr('class','tail-area-orange-alt').style('display','none');
  const tailAreaR3 = overlayG3.append('path').attr('class','tail-area-orange-alt').style('display','none');

  // Drag veil (place BEFORE markers so markers can intercept clicks)
  const veil = root.append('rect').attr('class','draggable-veil').attr('fill','transparent').attr('pointer-events','all');

  // b marker (bottom)
  const bMarkerG = root.append('g').attr('class','b-marker').style('cursor','ew-resize');
  const bLine = bMarkerG.append('line').attr('stroke','#ef4444').attr('stroke-width',3).attr('marker-end','url(#arrowUpRed)');
  // Add invisible wider line for easier dragging
  const bLineDragArea = bMarkerG.append('line').attr('stroke','transparent').attr('stroke-width',30).style('pointer-events','all');
  const bBG   = bMarkerG.append('rect').attr('fill','#fff').attr('opacity',0.98).attr('rx',4).attr('ry',4);
  const bLabelFO = bMarkerG.append('foreignObject').attr('width',200).attr('height',40).attr('x',-1000).attr('y',-1000);

  // β marker (top)
  const betaMarkerG = root.append('g').attr('class','beta-marker').style('cursor','grab');
  const betaLine = betaMarkerG.append('line').attr('stroke','#ef4444').attr('stroke-width',3).attr('marker-end','url(#arrowDownRed)');
  const betaLineDragArea = betaMarkerG.append('line').attr('stroke','transparent').attr('stroke-width',30).style('pointer-events','all');
  const betaBG   = betaMarkerG.append('rect').attr('fill','#fff').attr('opacity',0.98).attr('rx',4).attr('ry',4);
  const betaLabelFO = betaMarkerG.append('foreignObject').attr('width',200).attr('height',40).attr('x',-1000).attr('y',-1000);

  // β′ marker (top, orange)
  const betaPrimeMarkerG = root.append('g').attr('class','beta-prime-marker').style('cursor','grab');
  const betaPrimeLine = betaPrimeMarkerG.append('line').attr('stroke','#f97316').attr('stroke-width',3).attr('marker-end','url(#arrowDownOrange)');
  const betaPrimeLineDragArea = betaPrimeMarkerG.append('line').attr('stroke','transparent').attr('stroke-width',30).style('pointer-events','all');
  const betaPrimeBG   = betaPrimeMarkerG.append('rect').attr('fill','#fff').attr('opacity',0.98).attr('rx',4).attr('ry',4);
  const betaPrimeLabelFO = betaPrimeMarkerG.append('foreignObject').attr('width',200).attr('height',40).attr('x',-1000).attr('y',-1000);

  // β″ marker (top, orange)
  const betaPrimePrimeMarkerG = root.append('g').attr('class','beta-prime-prime-marker').style('cursor','grab');
  const betaPrimePrimeLine = betaPrimePrimeMarkerG.append('line').attr('stroke','#f97316').attr('stroke-width',3).attr('marker-end','url(#arrowDownOrange)');
  const betaPrimePrimeLineDragArea = betaPrimePrimeMarkerG.append('line').attr('stroke','transparent').attr('stroke-width',30).style('pointer-events','all');
  const betaPrimePrimeBG   = betaPrimePrimeMarkerG.append('rect').attr('fill','#fff').attr('opacity',0.98).attr('rx',4).attr('ry',4);
  const betaPrimePrimeLabelFO = betaPrimePrimeMarkerG.append('foreignObject').attr('width',200).attr('height',40).attr('x',-1000).attr('y',-1000);

  // Blue bound markers
  const blueMarksG = root.append('g').attr('class','blue-marks');

  // Axis labels will be handled as HTML overlays instead of foreignObjects

  // p-value text
  const pTextRight = root.append('text')
    .attr('fill', '#1d4ed8')
    .attr('font-weight', 700)
    .attr('font-size', 18)
    .attr('text-anchor', 'start')
    .attr('display', 'none');

  // Data & state
  let data=[], bins=[], data2=[], bins2=[], data3=[], bins3=[];
  const x = d3.scaleLinear().range([0, innerW]);
  const y = d3.scaleLinear().range([plotH, 0]);
  let shiftUnits = 0;
  let shiftUnits2 = 0;
  let shiftUnits3 = 0;
  let bValue = null;
  let betaValue = null;
  let ciMode = 'off';
  let blueMarks = [];
  let nextMarkId = 0;
  let blueMarkJustPlaced = false;
  let previousSE;

  let curveMode = 'off';
  let secondDistMode = 'off';
  let thirdDistMode = 'off';
  let powerMode = 'tails';
  let vertLinesMode = 'off';
  let histogramMode = 'off';
  let pValueMode = 'off';
  let vertLinesAttachment = 'cutoffs';
  let vertLineDistFromB = {left: 0, right: 0};
  let linkedMarks = {left: null, right: null};

  let fixedDomain = null;
  let domainOffset = 0;

  // SE slider range helper
  function updateSESliderRange(){
    const currentSE = +seInput.value || 1;
    const minSE = Math.max(0.05, currentSE * 0.3);
    const maxSE = currentSE * 1.7;
    const step = Math.max(0.001, currentSE * 0.02);
    seRange.min = minSE;
    seRange.max = maxSE;
    seRange.step = step;
    seRange.value = currentSE;
  }
  
  // Apply URL parameters
  if(urlBeta !== null) {
    const betaVal = parseFloat(urlBeta);
    betaInput.value = betaVal;
    betaValue = betaVal;
  } else {
    betaInput.value = '';
    betaValue = null;
  }
  if(urlSE !== null) {
    seInput.value = parseFloat(urlSE);
    updateSESliderRange();
  }
  if(urlDf !== null) {
    dfInput.value = parseInt(urlDf);
  }
  if(urlN !== null) {
    nValue = parseInt(urlN);
  }
  if(urlScale !== null) {
    scaleRange.value = parseFloat(urlScale);
  }
  if(urlBins !== null) {
    binsRange.value = parseInt(urlBins);
  }
  
  // Apply display mode parameters
  if(urlHistogram !== null) {
    // Only allow histogram=on if beta is also specified
    if(urlHistogram === 'on' && urlBeta !== null) {
      histogramMode = 'on';
      histogramBtn.classList.add('active');
    } else if(urlHistogram === 'off') {
      histogramMode = 'off';
      histogramBtn.classList.remove('active');
    }
  }
  
  if(urlCurve !== null) {
    curveMode = ['off', 'normal', 't'].includes(urlCurve) ? urlCurve : 'off';
    curveSeg.querySelectorAll('button').forEach(b => {
      b.classList.remove('active');
      if(b.getAttribute('data-curve') === curveMode) {
        b.classList.add('active');
      }
    });
  }
  
  if(urlCI !== null || urlAlpha !== null) {
    let ciValue = urlCI || urlAlpha;
    // Convert old format (90, 95, 99) to new format (.10, .05, .01) for backwards compatibility
    if(ciValue === '90') ciValue = '.10';
    else if(ciValue === '95') ciValue = '.05';
    else if(ciValue === '99') ciValue = '.01';
    const validCI = ['off', '.10', '.05', '.01'].includes(ciValue) ? ciValue : 'off';
    ciMode = validCI;
    ciSeg.querySelectorAll('button').forEach(b => {
      b.classList.remove('active');
      if(b.getAttribute('data-ci') === ciMode) {
        b.classList.add('active');
      }
    });
  }
  
  if(urlSecondDist !== null) {
    if(urlSecondDist === 'on') {
      secondDistMode = 'on';
      secondDistBtn.classList.add('active');
    }
  }
  
  if(urlPowerMode !== null) {
    powerMode = ['tails', 'power'].includes(urlPowerMode) ? urlPowerMode : 'tails';
    powerSeg.querySelectorAll('button').forEach(b => {
      b.classList.remove('active');
      if(b.getAttribute('data-power') === powerMode) {
        b.classList.add('active');
      }
    });
  }
  
  if(urlVertLines !== null) {
    if(urlVertLines === 'on') {
      vertLinesMode = 'on';
      vertLinesBtn.classList.add('active');
    }
  }
  
  if(urlPValue !== null) {
    if(urlPValue === 'on') {
      pValueMode = 'on';
      pValueBtn.classList.add('active');
    }
  }
  
  // Apply hide parameters
  if(hideSimulate) {
    regenBtn.parentElement.style.display = 'none';
  }
  if(hideBeta) {
    betaInput.style.display = 'none';
    betaBtn.style.display = 'none';
  }
  if(hideSE) {
    seInput.parentElement.style.display = 'none';
  }
  if(hideScale) {
    scaleRange.parentElement.style.display = 'none';
  }
  if(hideBins) {
    binsRange.parentElement.style.display = 'none';
  }
  if(hideCurve) {
    curveSeg.style.display = 'none';
  }
  if(hideDf) {
    dfInput.parentElement.style.display = 'none';
  }
  if(hideCI) {
    ciSeg.style.display = 'none';
  }
  if(hideVertLines) {
    vertLinesBtn.style.display = 'none';
  }
  if(hideHistogram) {
    histogramBtn.style.display = 'none';
  }
  if(hideSecondDist) {
    secondDistBtn.style.display = 'none';
    powerSeg.style.display = 'none';
  }
  if(hideThirdDist) {
    if(thirdDistBtn) thirdDistBtn.style.display = 'none';
  }
  if(hidePowerSeg) {
    powerSeg.style.display = 'none';
  }
  if(hideBInput) {
    bInput.style.display = 'none';
    bBtn.style.display = 'none';
  }
  if(hideP) {
    pValueBtn.style.display = 'none';
    pValueMode = 'off';
    pValueBtn.classList.remove('active');
  }
  
  previousSE = getSE();

  function restoreRedBetaOnTop(){ betaMarkerG.raise(); }

  // ---------- helpers ----------
  function getBeta(){ 
    if(betaValue !== null && !Number.isNaN(betaValue)) return betaValue;
    return 0;
  }
  function getSE(){ return Math.max(+seInput.value||1,1e-9); }
  function getScale(){ return Math.max(+scaleRange.value||1.75,0.1); }
  function getN(){ return Math.max(nValue||1000,1); }
  function getBins(){ return Math.max(1, Math.floor(+binsRange.value || 30)); }
  function getDf(){ return Math.max(1, Math.floor(+dfInput.value || 10)); }
  function pxPerUnit(){ const u0=x.domain()[0]; return Math.abs(x(u0+1)-x(u0)); }
  function dataUnitsPerPx(){ return 1/pxPerUnit(); }

  function cdfStandard(z){
    const sign = z < 0 ? -1 : 1;
    const xabs = Math.abs(z)/Math.SQRT2;
    const t = 1/(1+0.3275911*xabs);
    const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429;
    const erf = 1-(((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t)*Math.exp(-xabs*xabs);
    return 0.5*(1+sign*erf);
  }
  function zFor(mode){
    const zt={ '.10':1.6448536269514722, '.05':1.959963984540054, '.01':2.5758293035489004 };
    return zt[mode]||zt['.05'];
  }
  function pdfNormal(xv, beta, se){
    return (1/(se*Math.sqrt(2*Math.PI))) * Math.exp(-0.5*Math.pow((xv-beta)/se,2));
  }
  function pdfT(xv, beta, se, nu){
    const z = (xv - beta) / se;
    const v = nu;
    const norm = Math.exp(gammaln((v+1)/2) - gammaln(v/2)) / (Math.sqrt(v*Math.PI) * se);
    return norm * Math.pow(1 + (z*z)/v, -(v+1)/2);
  }
  function gammaln(x){
    const cof=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
    let y=x; let tmp=x+5.5; tmp-=(x+0.5)*Math.log(tmp);
    let ser=1.000000000190015;
    for(let j=0;j<6;j++){ y+=1; ser+=cof[j]/y; }
    return -tmp + Math.log(2.5066282746310005*ser/x);
  }

  function pdfTStd(x, nu){
    const v = nu;
    const norm = Math.exp(gammaln((v+1)/2) - gammaln(v/2)) / Math.sqrt(v*Math.PI);
    return norm * Math.pow(1 + (x*x)/v, -(v+1)/2);
  }
  function simpson(f, a, b){
    const c = 0.5*(a+b);
    return (b-a)/6 * (f(a) + 4*f(c) + f(b));
  }
  function adaptiveSimpson(f, a, b, eps, maxDepth){
    const S = simpson(f,a,b);
    return asr(f,a,b,eps,S,maxDepth);
    function asr(f,a,b,eps,S,depth){
      const c = 0.5*(a+b);
      const Sleft  = simpson(f,a,c);
      const Sright = simpson(f,c,b);
      const S2 = Sleft + Sright;
      if (depth <= 0 || Math.abs(S2-S) <= 15*eps) {
        return S2 + (S2-S)/15;
      }
      return asr(f,a,c,eps/2,Sleft,depth-1) + asr(f,c,b,eps/2,Sright,depth-1);
    }
  }
  function cdfT(z, nu){
    if (!isFinite(z)) return z>0 ? 1 : 0;
    if (z === 0) return 0.5;
    if (z < 0) return 1 - cdfT(-z, nu);
    const f = function(x){ return pdfTStd(x, nu); };
    const area = adaptiveSimpson(f, 0, z, 1e-7, 12);
    return 0.5 + area;
  }
  function tinv(p, nu){
    if (p <= 0) return -Infinity;
    if (p >= 1) return  Infinity;
    if (p === 0.5) return 0;
    const target = (p > 0.5) ? p : 1 - p;
    let lo = 0, hi = 20;
    while (cdfT(hi, nu) < target) hi *= 2;
    for (let i=0; i<60; i++){
      const mid = 0.5*(lo+hi);
      if (cdfT(mid, nu) < target) lo = mid; else hi = mid;
    }
    const q = 0.5*(lo+hi);
    return (p >= 0.5) ? q : -q;
  }
  function ciCrit(ciMode, curveMode, df){
    if (ciMode === 'off') return null;
    const alpha = parseFloat(ciMode);
    const conf = 1 - alpha;
    const pUpper = 0.5 * (1 + conf);
    return (curveMode === 't') ? tinv(pUpper, df) : zFor(ciMode);
  }

  function calculateTypeIError(ciMode){
    if(ciMode === 'off') return 0;
    return parseFloat(ciMode);
  }

  function calculateType2AndPower(){
    const beta = getBeta();
    const se = getSE();
    const crit = ciCrit(ciMode, curveMode, getDf());
    
    const blueMean = beta + shiftUnits;
    const cutL = blueMean - crit*se;
    const cutR = blueMean + crit*se;
    
    const orangeMean = beta + shiftUnits2;
    
    let type2Error, power;
    
    if(curveMode === 't'){
      const df = getDf();
      const zL = (cutL - orangeMean) / se;
      const zR = (cutR - orangeMean) / se;
      const probL = cdfT(zL, df);
      const probR = cdfT(zR, df);
      type2Error = probR - probL;
      power = 1 - type2Error;
    } else {
      const zL = (cutL - orangeMean) / se;
      const zR = (cutR - orangeMean) / se;
      const probL = cdfStandard(zL);
      const probR = cdfStandard(zR);
      type2Error = probR - probL;
      power = 1 - type2Error;
    }
    
    return { type2Error, power };
  }

  function setXDomain(){
    const beta = getBeta();
    if (fixedDomain) { 
      x.domain([fixedDomain[0] + domainOffset, fixedDomain[1] + domainOffset]); 
      return; 
    }
    const span = 10 * getScale();
    x.domain([beta - span/2 + domainOffset, beta + span/2 + domainOffset]);
  }

  function gaussian(n, mean=0, sd=1){
    const arr=new Float64Array(n);
    for(let i=0;i<n;i++){
      let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random();
      let z=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
      arr[i]=mean+sd*z;
    }
    return Array.from(arr);
  }

  function fixedThresholds(nbins){
    const d0=x.domain()[0], d1=x.domain()[1];
    const ts=[];
    for(let i=0;i<=nbins;i++){ ts.push(d0 + (i/nbins)*(d1-d0)); }
    return ts;
  }
  function computeBins(values, nbins){
    if(!values||values.length===0) return [];
    const binner=d3.bin().domain(x.domain()).thresholds(fixedThresholds(nbins));
    return binner(values);
  }

  function recomputeYDomain(nbins){
    // Smooth adaptive scaling: expand y-axis only when needed
    const beta=getBeta(), se=getSE();
    const domain = x.domain();
    const binW = (domain[1]-domain[0]) / nbins;
    
    // Get actual bar heights
    const barMax = bins.length ? d3.max(bins, d => d.length) : 1;
    const barMax2 = (secondDistMode === 'on' && bins2.length) ? d3.max(bins2, d => d.length) : 0;
    const barMax3 = (thirdDistMode === 'on' && bins3.length) ? d3.max(bins3, d => d.length) : 0;
    const actualMax = Math.max(barMax, barMax2, barMax3, 1);
    
    // When curve is shown, consider its height
    let curveMax = 0;
    if(curveMode !== 'off') {
      // Use currentN if we have samples, otherwise use 1000 for nice scaling when curve is shown alone
      const nForCurve = currentN > 0 ? currentN : 1000;
      for (let i=0;i<128;i++){
        const xv = domain[0] + (i/127)*(domain[1]-domain[0]);
        const pdf = (curveMode==='t') ? pdfT(xv, beta, se, getDf()) : pdfNormal(xv, beta, se);
        curveMax = Math.max(curveMax, nForCurve * binW * pdf);
      }
    }
    
    // Calculate what the curve would be at 1000 samples for reference
    let curveMax1000 = 0;
    for (let i=0;i<128;i++){
      const xv = domain[0] + (i/127)*(domain[1]-domain[0]);
      const pdf = (curveMode==='t') ? pdfT(xv, beta, se, getDf()) : pdfNormal(xv, beta, se);
      curveMax1000 = Math.max(curveMax1000, 1000 * binW * pdf);
    }
    
    // Start with initial expected max for small n (30 samples)
    const initialMax = curveMax1000 * (30 / 1000);
    
    // Calculate yMax to leave approximately 30px at the top
    const topPadding = 30;
    const scaleFactor = innerH / (innerH - topPadding);
    
    // Use the larger of: actual bars, curve height, or initial minimum (all with 30px headroom)
    const yMax = Math.max(actualMax * scaleFactor, curveMax * scaleFactor, initialMax);
    
    y.domain([0, yMax]);
  }

  function layoutStatic(){
    plotH = Math.max(1, innerH - axisInsetTop - axisInsetBottom);
    y.range([plotH, 0]); x.range([0, innerW]);
    xAxisTopG.attr('transform','translate(0,'+axisInsetTop+')');
    xAxisG.attr('transform','translate(0,'+(axisInsetTop+plotH)+')');
    plotWrap.attr('transform','translate(0,'+axisInsetTop+')');
    veil.attr('x',0).attr('y',axisInsetTop).attr('width',innerW).attr('height',plotH);
    
    // Position axis labels on the left side with symmetrical spacing
    const labelOffset = 16;
    const topLabelY = axisInsetTop + labelOffset - 6;
    const bottomLabelY = axisInsetTop + plotH - labelOffset - 28;
    
    // Position HTML overlay labels (outside SVG for better cross-browser compatibility)
    const topLabel = document.getElementById('topAxisLabel');
    const bottomLabel = document.getElementById('bottomAxisLabel');
    
    if(topLabel && bottomLabel) {
      // Calculate absolute positions relative to the chart container
      const leftPos = margin.left + 'px';
      const topPos = (margin.top + topLabelY) + 'px';
      const bottomPos = (margin.top + bottomLabelY) + 'px';
      
      topLabel.style.left = leftPos;
      topLabel.style.top = topPos;
      topLabel.innerHTML = '<span style="color:#333;font-weight:700;font-size:28px;" class="latex-label">' + renderLatex(labelParamLatex) + '</span><span style="color:#666;font-size:12px;line-height:1.3;font-weight:600;">population<br>parameter</span>';
      
      bottomLabel.style.left = leftPos;
      bottomLabel.style.top = bottomPos;
      bottomLabel.innerHTML = '<span style="color:#333;font-weight:700;font-size:28px;" class="latex-label">' + renderLatex(labelSampleStatLatex) + '</span><span style="color:#666;font-size:12px;line-height:1.3;font-weight:600;">sample<br>statistic</span>';
    }
  }

  function drawAxes(){
    const xAxis=d3.axisBottom(x).tickSizeOuter(0);
    const xAxisTop=d3.axisTop(x).tickSizeOuter(0);
    xAxisG.call(xAxis); xAxisTopG.call(xAxisTop);
  }

  function drawHistogram(){
    if(histogramMode === 'on'){
      const bar=histG.selectAll('rect').data(bins,d => d.x0+'-'+d.x1);
      bar.enter().append('rect').attr('class','hist-bar')
        .style('fill', getMainFill())
        .style('stroke', getMainStroke())
        .attr('x',d => x(d.x0))
        .attr('width',d => Math.max(0,x(d.x1)-x(d.x0)-1))
        .attr('y',d => y(d.length))
        .attr('height',d => y(0)-y(d.length));
      bar
        .style('fill', getMainFill())
        .style('stroke', getMainStroke())
        .attr('x',d => x(d.x0))
        .attr('width',d => Math.max(0,x(d.x1)-x(d.x0)-1))
        .attr('y',d => y(d.length))
        .attr('height',d => y(0)-y(d.length));
      bar.exit().remove();
      
      if(secondDistMode === 'on'){
        const bar2=histG2.selectAll('rect').data(bins2,d => d.x0+'-'+d.x1);
        bar2.enter().append('rect').attr('class','hist-bar-2')
          .style('fill', getSecondaryFill())
          .style('stroke', getSecondaryStroke())
          .attr('x',d => x(d.x0))
          .attr('width',d => Math.max(0,x(d.x1)-x(d.x0)-1))
          .attr('y',d => y(d.length))
          .attr('height',d => y(0)-y(d.length));
        bar2
          .attr('x',d => x(d.x0))
          .attr('width',d => Math.max(0,x(d.x1)-x(d.x0)-1))
          .attr('y',d => y(d.length))
          .attr('height',d => y(0)-y(d.length));
        bar2.exit().remove();
      } else {
        histG2.selectAll('rect').remove();
      }
      
      if(thirdDistMode === 'on'){
        const bar3=histG3.selectAll('rect').data(bins3,d => d.x0+'-'+d.x1);
        bar3.enter().append('rect').attr('class','hist-bar-3')
          .style('fill', getSecondaryFill())
          .style('stroke', getSecondaryStroke())
          .attr('x',d => x(d.x0))
          .attr('width',d => Math.max(0,x(d.x1)-x(d.x0)-1))
          .attr('y',d => y(d.length))
          .attr('height',d => y(0)-y(d.length));
        bar3
          .attr('x',d => x(d.x0))
          .attr('width',d => Math.max(0,x(d.x1)-x(d.x0)-1))
          .attr('y',d => y(d.length))
          .attr('height',d => y(0)-y(d.length));
        bar3.exit().remove();
      } else {
        histG3.selectAll('rect').remove();
      }
    } else {
      histG.selectAll('rect').remove();
      histG2.selectAll('rect').remove();
      histG3.selectAll('rect').remove();
    }
    drawHistogramTailShading();
  }

  function drawHistogramTailShading(){
    const doShadeBars = (ciMode !== 'off') && (curveMode === 'off') && (histogramMode === 'on');
    
    // Show/hide alpha cutoff arrows
    alphaCutoffArrowL.style('display', doShadeBars ? null : 'none');
    alphaCutoffArrowR.style('display', doShadeBars ? null : 'none');
    
    const sel = histShadeG.selectAll('rect')
      .data(doShadeBars ? bins : [], d => d.x0 + '-' + d.x1);
    sel.exit().remove();
    
    const sel2 = histShadeG2.selectAll('rect')
      .data(doShadeBars && secondDistMode === 'on' ? bins2 : [], d => d.x0 + '-' + d.x1);
    sel2.exit().remove();
    
    const sel3 = histShadeG3.selectAll('rect')
      .data(doShadeBars && thirdDistMode === 'on' ? bins3 : [], d => d.x0 + '-' + d.x1);
    sel3.exit().remove();
    
    // P-value histogram shading (light blue from b to tail)
    // This is independent of alpha/CI shading, so do it before the early return
    histShadePG.selectAll('rect').remove();
    
    const showHistPValue = pValueMode === 'on' && bValue !== null && !Number.isNaN(bValue) && histogramMode === 'on' && curveMode === 'off' && bins && bins.length > 0;
    
    if(showHistPValue) {
      const beta = getBeta();
      const betaVal = beta + shiftUnits;
      const bLocal = bValue - shiftUnits;
      
      function pValueFrac(d) {
        const w = d.x1 - d.x0; if (w <= 0) return 0;
        
        // Determine which tail based on b position relative to beta (in local coords)
        if(bLocal > beta) {
          // Shade right tail from b onwards
          if (d.x0 >= bLocal) return 1;
          if (d.x1 <= bLocal) return 0;
          return (d.x1 - bLocal) / w;
        } else {
          // Shade left tail up to b
          if (d.x1 <= bLocal) return 1;
          if (d.x0 >= bLocal) return 0;
          return (bLocal - d.x0) / w;
        }
      }
      
      histShadePG.selectAll('rect')
        .data(bins, d => d.x0 + '-' + d.x1)
        .enter().append('rect')
        .attr('class','hist-shade-p')
        .attr('x', d => x(d.x0))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('y', d => {
          const frac = pValueFrac(d);
          const fullH = y(0) - y(d.length);
          const h = frac * fullH;
          return y(0) - h;
        })
        .attr('height', d => {
          const frac = pValueFrac(d);
          const fullH = y(0) - y(d.length);
          return frac * fullH;
        });
    }
    
    if (!doShadeBars) return;

    const beta = getBeta(), se = getSE();
    
    // When curve is off, use empirical percentiles from the simulated data
    // This is how bootstrapped distributions work
    let cutL, cutR;
    if (data.length > 0) {
      const alpha = parseFloat(ciMode);
      const sorted = [...data].sort((a, b) => a - b);
      const lowerIdx = Math.floor((alpha / 2) * sorted.length);
      const upperIdx = Math.floor((1 - alpha / 2) * sorted.length) - 1;
      cutL = sorted[Math.max(0, lowerIdx)];
      cutR = sorted[Math.min(sorted.length - 1, upperIdx)];
    } else {
      // Fallback to theoretical if no data
      const crit = ciCrit(ciMode, curveMode, getDf());
      cutL = beta - crit * se;
      cutR = beta + crit * se;
    }
    
    // Position alpha cutoff arrows (just the arrowhead, no line)
    const arrowY = plotH - 10;  // Position just above x-axis
    alphaCutoffArrowL.attr('x1', x(cutL)).attr('x2', x(cutL)).attr('y1', arrowY).attr('y2', arrowY + 10);
    alphaCutoffArrowR.attr('x1', x(cutR)).attr('x2', x(cutR)).attr('y1', arrowY).attr('y2', arrowY + 10);

    function tailFrac(d){
      const w = d.x1 - d.x0; if (w <= 0) return 0;
      if (d.x1 <= cutL || d.x0 >= cutR) return 1;
      if (d.x0 >= cutL && d.x1 <= cutR) return 0;
      let f = 0;
      if (d.x0 < cutL && d.x1 > cutL) f += (cutL - d.x0) / w;
      if (d.x0 < cutR && d.x1 > cutR) f += (d.x1 - cutR) / w;
      return Math.max(0, Math.min(1, f));
    }

    const merged = sel.enter().append('rect').attr('class','hist-shade').merge(sel);
    merged
      .attr('x', d => x(d.x0))
      .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr('y', d => {
        const frac = tailFrac(d);
        const fullH = y(0) - y(d.length);
        const h = frac * fullH;
        return y(0) - h;
      })
      .attr('height', d => {
        const frac = tailFrac(d);
        const fullH = y(0) - y(d.length);
        return frac * fullH;
      });
      
    if(secondDistMode === 'on'){
      // In power mode, use power/type2 shading; in tails mode, use tail shading
      if(powerMode === 'power'){
        // Power mode: cutoffs based on blue distribution, shading on orange distribution
        const betaRelative = beta + (shiftUnits - shiftUnits2);
        const cutLPower = betaRelative - crit*se;
        const cutRPower = betaRelative + crit*se;
        
        function powerFrac(d){
          const w = d.x1 - d.x0; if (w <= 0) return 0;
          // Power is outside the cutoffs
          if (d.x1 <= cutLPower || d.x0 >= cutRPower) return 1;
          if (d.x0 >= cutLPower && d.x1 <= cutRPower) return 0;
          let f = 0;
          if (d.x0 < cutLPower && d.x1 > cutLPower) f += (cutLPower - d.x0) / w;
          if (d.x0 < cutRPower && d.x1 > cutRPower) f += (d.x1 - cutRPower) / w;
          return Math.max(0, Math.min(1, f));
        }
        
        function type2Frac(d){
          const w = d.x1 - d.x0; if (w <= 0) return 0;
          // Type 2 is inside the cutoffs
          if (d.x1 <= cutLPower || d.x0 >= cutRPower) return 0;
          if (d.x0 >= cutLPower && d.x1 <= cutRPower) return 1;
          let f = 0;
          if (d.x0 < cutLPower && d.x1 > cutLPower) f += (d.x1 - cutLPower) / w;
          if (d.x0 < cutRPower && d.x1 > cutRPower) f += (cutRPower - d.x0) / w;
          return Math.max(0, Math.min(1, f));
        }
        
        // Clear existing and create two layers: power and type2
        sel2.remove();
        
        // Power shading (orange)
        const selPower = histShadeG2.selectAll('rect.power-shade')
          .data(bins2, d => d.x0 + '-' + d.x1);
        selPower.exit().remove();
        const mergedPower = selPower.enter().append('rect').attr('class','power-shade')
          .style('fill', getPowerColor())
          .style('fill-opacity', 0.4)
          .merge(selPower);
        mergedPower
          .attr('x', d => x(d.x0))
          .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr('y', d => {
            const frac = powerFrac(d);
            const fullH = y(0) - y(d.length);
            const h = frac * fullH;
            return y(0) - h;
          })
          .attr('height', d => {
            const frac = powerFrac(d);
            const fullH = y(0) - y(d.length);
            return frac * fullH;
          });
        
        // Type 2 shading (yellow)
        const selType2 = histShadeG2.selectAll('rect.type2-shade')
          .data(bins2, d => d.x0 + '-' + d.x1);
        selType2.exit().remove();
        const mergedType2 = selType2.enter().append('rect').attr('class','type2-shade')
          .style('fill', getType2Color())
          .style('fill-opacity', 0.3)
          .merge(selType2);
        mergedType2
          .attr('x', d => x(d.x0))
          .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr('y', d => {
            const frac = type2Frac(d);
            const fullH = y(0) - y(d.length);
            const h = frac * fullH;
            return y(0) - h;
          })
          .attr('height', d => {
            const frac = type2Frac(d);
            const fullH = y(0) - y(d.length);
            return frac * fullH;
          });
      } else {
        // Tails mode: regular tail shading
        histShadeG2.selectAll('rect.power-shade').remove();
        histShadeG2.selectAll('rect.type2-shade').remove();
        
        const merged2 = sel2.enter().append('rect').attr('class','hist-shade-2')
          .style('fill', getSecondaryAlpha())
          .merge(sel2);
        merged2
          .attr('x', d => x(d.x0))
          .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr('y', d => {
            const frac = tailFrac(d);
            const fullH = y(0) - y(d.length);
            const h = frac * fullH;
            return y(0) - h;
          })
          .attr('height', d => {
            const frac = tailFrac(d);
            const fullH = y(0) - y(d.length);
            return frac * fullH;
          });
      }
    }
    
    // Third distribution tail shading (always in tails mode, never in power mode)
    if(thirdDistMode === 'on'){
      const merged3 = sel3.enter().append('rect').attr('class','hist-shade-3')
        .style('fill', getSecondaryAlpha())
        .merge(sel3);
      merged3
        .attr('x', d => x(d.x0))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('y', d => {
          const frac = tailFrac(d);
          const fullH = y(0) - y(d.length);
          const h = frac * fullH;
          return y(0) - h;
        })
        .attr('height', d => {
          const frac = tailFrac(d);
          const fullH = y(0) - y(d.length);
          return frac * fullH;
        });
    }
  }

  function drawOverlay(){
    const showCurve = (curveMode !== 'off');
    const showCIOverCurve = (ciMode !== 'off') && (curveMode !== 'off');
    const showSecond = (secondDistMode === 'on') && (curveMode !== 'off');
    const showCIOverSecond = (ciMode !== 'off') && showSecond && (powerMode === 'tails');
    const showPowerOverSecond = (ciMode !== 'off') && showSecond && (powerMode === 'power');
    const showThird = (thirdDistMode === 'on') && (curveMode !== 'off');
    const showCIOverThird = (ciMode !== 'off') && showThird;

    curvePath.style('display', showCurve ? null : 'none');
    curvePath2.style('display', showSecond ? null : 'none');
    curvePath3.style('display', showThird ? null : 'none');
    tailLineL.style('display', showCIOverCurve ? null : 'none');
    tailLineR.style('display', showCIOverCurve ? null : 'none');
    tailAreaL.style('display', showCIOverCurve ? null : 'none');
    tailAreaR.style('display', showCIOverCurve ? null : 'none');
    tailLineL2.style('display', showCIOverSecond ? null : 'none');
    tailLineR2.style('display', showCIOverSecond ? null : 'none');
    tailAreaL2.style('display', showCIOverSecond ? null : 'none');
    tailAreaR2.style('display', showCIOverSecond ? null : 'none');
    
    tailLineL3.style('display', showCIOverThird ? null : 'none');
    tailLineR3.style('display', showCIOverThird ? null : 'none');
    tailAreaL3.style('display', showCIOverThird ? null : 'none');
    tailAreaR3.style('display', showCIOverThird ? null : 'none');
    
    powerAreaL.style('display', showPowerOverSecond ? null : 'none');
    powerAreaR.style('display', showPowerOverSecond ? null : 'none');
    type2Area.style('display', showPowerOverSecond ? null : 'none');
    
    // Update legend
    const showLegend = (powerMode === 'power') && (ciMode !== 'off');
    
    if(showLegend){
      legendEl.classList.add('visible');
      
      if(secondDistMode === 'on'){
        const { type2Error, power } = calculateType2AndPower();
        legendEl.innerHTML = `
          <div class="legend-item">
            <div class="legend-color power"></div>
            <span>Power = ${power.toFixed(3)}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color type2"></div>
            <span>Type II Error = ${type2Error.toFixed(3)}</span>
          </div>
        `;
      } else {
        const alpha = calculateTypeIError(ciMode);
        legendEl.innerHTML = `
          <div class="legend-item">
            <div class="legend-color type1"></div>
            <span>Type I Error (α) = ${alpha.toFixed(3)}</span>
          </div>
        `;
      }
    } else {
      legendEl.classList.remove('visible');
    }

    if(!(showCurve || showCIOverCurve || showSecond || showThird)){
      tailAreaL.attr('d', null); tailAreaR.attr('d', null);
      tailAreaL2.attr('d', null); tailAreaR2.attr('d', null);
      tailAreaL3.attr('d', null); tailAreaR3.attr('d', null);
      powerAreaL.attr('d', null); powerAreaR.attr('d', null);
      type2Area.attr('d', null);
      
      // Clear P-AREA before returning
      overlayG.selectAll('.p-area').remove();
      
      return;
    }

    const beta=getBeta(), se=getSE();
    // Use currentN if we have samples, otherwise use 1000 for nice scaling when curve is shown alone
    const n = currentN > 0 ? currentN : 1000;
    const nbins = getBins();
    const domain = x.domain();
    const binW = (domain[1]-domain[0]) / nbins;

    const xs = [];
    for(let i=0;i<256;i++){ xs.push(domain[0] + (i/255)*(domain[1]-domain[0])); }

    function expected(t){
      if (curveMode === 't') return n * binW * pdfT(t, beta, se, getDf());
      return n * binW * pdfNormal(t, beta, se);
    }

    function expected2(t){
      if (curveMode === 't') return n * binW * pdfT(t, beta, se, getDf());
      return n * binW * pdfNormal(t, beta, se);
    }

    function expected3(t){
      if (curveMode === 't') return n * binW * pdfT(t, beta, se, getDf());
      return n * binW * pdfNormal(t, beta, se);
    }

    if(showCurve){
      // Draw as filled area if histogram is off OR if there's no histogram data yet
      const showCurveAsFill = (histogramMode === 'off') || (bins.length === 0);
      
      if(showCurveAsFill){
        const areaGen = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected(d)));
        curvePath.attr('d', areaGen(xs));
        curvePath.style('fill', getMainFill()).style('stroke', getMainStroke()).style('stroke-width', '2');
      } else {
        const lineGen = d3.line().x(d => x(d)).y(d => y(expected(d)));
        curvePath.attr('d', lineGen(xs));
        curvePath.style('fill', 'none').style('stroke', getMainStroke()).style('stroke-width', '2');
      }
    }

    if(showSecond){
      // Draw as filled area if histogram is off OR if there's no histogram data yet
      const showCurveAsFill = (histogramMode === 'off') || (bins2.length === 0);
      
      if(showCurveAsFill){
        const areaGen2 = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected2(d)));
        curvePath2.attr('d', areaGen2(xs));
        curvePath2.style('fill', getSecondaryFill()).style('stroke', getSecondaryStroke()).style('stroke-width', '2');
      } else {
        const lineGen2 = d3.line().x(d => x(d)).y(d => y(expected2(d)));
        curvePath2.attr('d', lineGen2(xs));
        curvePath2.style('fill', 'none').style('stroke', getSecondaryStroke()).style('stroke-width', '2');
      }
    }

    if(showThird){
      // Draw as filled area if histogram is off OR if there's no histogram data yet
      const showCurveAsFill = (histogramMode === 'off') || (bins3.length === 0);
      
      if(showCurveAsFill){
        const areaGen3 = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected3(d)));
        curvePath3.attr('d', areaGen3(xs));
        curvePath3.style('fill', getSecondaryFill()).style('stroke', getSecondaryStroke()).style('stroke-width', '2');
      } else {
        const lineGen3 = d3.line().x(d => x(d)).y(d => y(expected3(d)));
        curvePath3.attr('d', lineGen3(xs));
        curvePath3.style('fill', 'none').style('stroke', getSecondaryStroke()).style('stroke-width', '2');
      }
    }

    if(showCIOverCurve){
      const crit = ciCrit(ciMode, curveMode, getDf());
      const cutL = beta - crit*se, cutR = beta + crit*se;
      const yCurveL = y(expected(cutL));
      const yCurveR = y(expected(cutR));
      tailLineL.attr('x1', x(cutL)).attr('x2', x(cutL)).attr('y1', plotH).attr('y2', yCurveL);
      tailLineR.attr('x1', x(cutR)).attr('x2', x(cutR)).attr('y1', plotH).attr('y2', yCurveR);

      const xsL = xs.filter(v => v < cutL).concat([cutL]).sort((a,b) => a-b);
      const xsR = [cutR].concat(xs.filter(v => v > cutR)).sort((a,b) => a-b);
      const area = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected(d)));
      tailAreaL.attr('d', xsL.length ? area(xsL) : null);
      tailAreaR.attr('d', xsR.length ? area(xsR) : null);
    } else {
      tailAreaL.attr('d', null);
      tailAreaR.attr('d', null);
    }

    if(showCIOverSecond){
      const crit = ciCrit(ciMode, curveMode, getDf());
      const cutL2 = beta - crit*se, cutR2 = beta + crit*se;
      const yCurveL2 = y(expected2(cutL2));
      const yCurveR2 = y(expected2(cutR2));
      tailLineL2.attr('x1', x(cutL2)).attr('x2', x(cutL2)).attr('y1', plotH).attr('y2', yCurveL2);
      tailLineR2.attr('x1', x(cutR2)).attr('x2', x(cutR2)).attr('y1', plotH).attr('y2', yCurveR2);

      const xsL2 = xs.filter(v => v < cutL2).concat([cutL2]).sort((a,b) => a-b);
      const xsR2 = [cutR2].concat(xs.filter(v => v > cutR2)).sort((a,b) => a-b);
      const area2 = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected2(d)));
      tailAreaL2.attr('d', xsL2.length ? area2(xsL2) : null);
      tailAreaR2.attr('d', xsR2.length ? area2(xsR2) : null);
    } else {
      tailAreaL2.attr('d', null); tailAreaR2.attr('d', null);
    }
    
    if(showCIOverThird){
      const crit = ciCrit(ciMode, curveMode, getDf());
      const cutL3 = beta - crit*se, cutR3 = beta + crit*se;
      const yCurveL3 = y(expected3(cutL3));
      const yCurveR3 = y(expected3(cutR3));
      tailLineL3.attr('x1', x(cutL3)).attr('x2', x(cutL3)).attr('y1', plotH).attr('y2', yCurveL3);
      tailLineR3.attr('x1', x(cutR3)).attr('x2', x(cutR3)).attr('y1', plotH).attr('y2', yCurveR3);

      const xsL3 = xs.filter(v => v < cutL3).concat([cutL3]).sort((a,b) => a-b);
      const xsR3 = [cutR3].concat(xs.filter(v => v > cutR3)).sort((a,b) => a-b);
      const area3 = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected3(d)));
      tailAreaL3.attr('d', xsL3.length ? area3(xsL3) : null);
      tailAreaR3.attr('d', xsR3.length ? area3(xsR3) : null);
    } else {
      tailAreaL3.attr('d', null); tailAreaR3.attr('d', null);
    }
    
    if(showPowerOverSecond){
      const betaRelative = beta + (shiftUnits - shiftUnits2);
      const crit = ciCrit(ciMode, curveMode, getDf());
      const cutL = betaRelative - crit*se;
      const cutR = betaRelative + crit*se;
      
      const xsL_power = xs.filter(v => v < cutL).concat([cutL]).sort((a,b) => a-b);
      const xsR_power = [cutR].concat(xs.filter(v => v > cutR)).sort((a,b) => a-b);
      const areaPower = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected2(d)));
      powerAreaL.attr('d', xsL_power.length ? areaPower(xsL_power) : null);
      powerAreaR.attr('d', xsR_power.length ? areaPower(xsR_power) : null);
      
      const xs_type2 = [cutL].concat(xs.filter(v => v > cutL && v < cutR)).concat([cutR]).sort((a,b) => a-b);
      const areaType2 = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected2(d)));
      type2Area.attr('d', xs_type2.length ? areaType2(xs_type2) : null);
    } else {
      powerAreaL.attr('d', null);
      powerAreaR.attr('d', null);
      type2Area.attr('d', null);
    }
    
    // P-value areas (show tail from b to end) - only for curve display
    // Use remove/recreate pattern for reliability  
    overlayG.selectAll('.p-area').remove();
    
    const showPArea = (pValueMode === 'on') && (bValue !== null && !Number.isNaN(bValue)) && (curveMode !== 'off');
    
    if(showPArea) {
      const betaVal = beta + shiftUnits;
      const bLocal = bValue - shiftUnits;
      
      if(bLocal > beta) {
        // Shade right tail from b to infinity (in local coordinates)
        const xsR_p = [bLocal].concat(xs.filter(v => v > bLocal)).sort((a,b) => a-b);
        const areaP = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected(d)));
        overlayG.append('path')
          .attr('class','p-area')
          .attr('d', xsR_p.length ? areaP(xsR_p) : null);
      } else {
        // Shade left tail from -infinity to b (in local coordinates)
        const xsL_p = xs.filter(v => v < bLocal).concat([bLocal]).sort((a,b) => a-b);
        const areaP = d3.area().x(d => x(d)).y0(plotH).y1(d => y(expected(d)));
        overlayG.append('path')
          .attr('class','p-area')
          .attr('d', xsL_p.length ? areaP(xsL_p) : null);
      }
    }
  }

  function drawVerticalLines(){
    const showVLines = (vertLinesMode === 'on') && (ciMode !== 'off') && (curveMode !== 'off');
    
    vertLineL.style('display', showVLines ? null : 'none');
    vertLineR.style('display', showVLines ? null : 'none');
    
    if(!showVLines) return;
    
    let cutL, cutR;
    
    if(vertLinesAttachment === 'cutoffs'){
      const beta = getBeta();
      const se = getSE();
      const crit = ciCrit(ciMode, curveMode, getDf());
      cutL = beta - crit*se;
      cutR = beta + crit*se;
    } else {
      if(bValue !== null && !Number.isNaN(bValue)){
        cutL = (bValue - vertLineDistFromB.left) - shiftUnits;
        cutR = (bValue + vertLineDistFromB.right) - shiftUnits;
      } else {
        const beta = getBeta();
        const se = getSE();
        const crit = ciCrit(ciMode, curveMode, getDf());
        cutL = beta - crit*se;
        cutR = beta + crit*se;
      }
    }
    
    const xPosL = x(cutL);
    const xPosR = x(cutR);
    const topY = 0;
    const bottomY = plotH;
    
    vertLineL.attr('x1', xPosL).attr('x2', xPosL).attr('y1', topY).attr('y2', bottomY);
    vertLineR.attr('x1', xPosR).attr('x2', xPosR).attr('y1', topY).attr('y2', bottomY);
  }

  function drawBMarker(){
    const bMarkerLabelDiv = document.getElementById('bMarkerLabel');
    if(bValue===null || Number.isNaN(bValue)){ 
      bMarkerG.attr('display','none'); 
      pTextRight.attr('display','none'); 
      if(bMarkerLabelDiv) bMarkerLabelDiv.style.display = 'none';
      return; 
    }
    bMarkerG.attr('display', null);
    const xPos = x(bValue);
    const axisY = axisInsetTop + plotH;
    const arrowBottom = axisY + 20;
    bLine.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowBottom).attr('y2', axisY);
    // Make drag area cover the entire arrow with extra height
    bLineDragArea.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowBottom + 10).attr('y2', axisY);
    
    const labelHtml = '<div style="color:#ef4444;font-weight:700;font-size:18px;white-space:nowrap;background:#fff;opacity:0.98;border-radius:4px;padding:2px 6px 3px 6px;line-height:1.1;" class="latex-label">' + 
      renderLatex(labelSampleStatLatex) + ' = ' + bValue.toFixed(2) + '</div>';
    
    if(bMarkerLabelDiv) {
      bMarkerLabelDiv.innerHTML = labelHtml;
      bMarkerLabelDiv.style.display = 'block';
      
      // Use requestAnimationFrame to ensure layout is complete before measuring
      requestAnimationFrame(() => {
        setTimeout(() => {
          const bb = bMarkerLabelDiv.getBoundingClientRect();
          const chartRect = chartWrap.getBoundingClientRect();
          const svgRect = svg.node().getBoundingClientRect();
          
          // Calculate position relative to chart container - centered under arrow
          const absoluteX = svgRect.left - chartRect.left + margin.left + xPos;
          const absoluteY = svgRect.top - chartRect.top + margin.top + arrowBottom + 24;
          
          bMarkerLabelDiv.style.left = (absoluteX - bb.width/2) + 'px';
          bMarkerLabelDiv.style.top = (absoluteY - bb.height/2) + 'px';
          
          // Hide the old foreignObject label
          bLabelFO.attr('x', -1000).attr('y', -1000);
          bBG.attr('x', -1000).attr('y', -1000);
          
          // Now position p-value after b marker is positioned
          updatePTextToRightOfB();
        }, 0);
      });
    }
  }

  function drawBetaMarker(){
    const betaMarkerLabelDiv = document.getElementById('betaMarkerLabel');
    if(betaValue === null || Number.isNaN(betaValue)){
      betaMarkerG.attr('display', 'none');
      if(betaMarkerLabelDiv) betaMarkerLabelDiv.style.display = 'none';
      return;
    }
    
    betaMarkerG.attr('display', null);
    const beta = getBeta();
    const betaVal = beta + shiftUnits;
    const xPos = x(betaVal);
    const axisY = axisInsetTop;
    const arrowTop = axisY - 20;
    
    betaLine.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowTop).attr('y2', axisY);
    // Make drag area cover the entire arrow with extra height
    betaLineDragArea.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowTop - 10).attr('y2', axisY);
    
    const labelHtml = '<div style="text-align:center;color:#ef4444;font-weight:700;font-size:18px;white-space:nowrap;background:#fff;opacity:0.98;border-radius:4px;padding:2px 6px 3px 6px;" class="latex-label">' + 
      renderLatex(labelParamLatex) + ' = ' + betaVal.toFixed(2) + '</div>';
    
    if(betaMarkerLabelDiv) {
      betaMarkerLabelDiv.innerHTML = labelHtml;
      betaMarkerLabelDiv.style.display = 'block';
      
      setTimeout(() => {
        const bb = betaMarkerLabelDiv.getBoundingClientRect();
        const chartRect = chartWrap.getBoundingClientRect();
        const svgRect = svg.node().getBoundingClientRect();
        
        // Calculate position relative to chart container
        const absoluteX = svgRect.left - chartRect.left + margin.left + xPos;
        const absoluteY = svgRect.top - chartRect.top + margin.top + arrowTop - 20;
        
        betaMarkerLabelDiv.style.left = (absoluteX - bb.width/2) + 'px';
        betaMarkerLabelDiv.style.top = (absoluteY - bb.height/2) + 'px';
        
        // Hide the old foreignObject label
        betaLabelFO.attr('x', -1000).attr('y', -1000);
        betaBG.attr('x', -1000).attr('y', -1000);
      }, 0);
    }
  }

  function drawBetaPrimeMarker(){
    const betaPrimeMarkerLabelDiv = document.getElementById('betaPrimeMarkerLabel');
    const showSecond = (secondDistMode === 'on');
    if(!showSecond){
      betaPrimeMarkerG.attr('display', 'none');
      if(betaPrimeMarkerLabelDiv) betaPrimeMarkerLabelDiv.style.display = 'none';
      return;
    }
    betaPrimeMarkerG.attr('display', null);
    const beta2 = getBeta() + shiftUnits2;
    const xPos = x(beta2);
    const axisY = axisInsetTop;
    const arrowTop = axisY - 20;
    
    betaPrimeLine.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowTop).attr('y2', axisY);
    // Make drag area cover the entire arrow with extra height
    betaPrimeLineDragArea.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowTop - 10).attr('y2', axisY);
    
    const labelHtml = '<div style="text-align:center;color:#f97316;font-weight:700;font-size:18px;white-space:nowrap;background:#fff;opacity:0.98;border-radius:4px;padding:2px 6px 3px 6px;" class="latex-label">' + 
      renderLatex(labelParamLatex + '\'') + ' = ' + beta2.toFixed(2) + '</div>';
    
    if(betaPrimeMarkerLabelDiv) {
      betaPrimeMarkerLabelDiv.innerHTML = labelHtml;
      betaPrimeMarkerLabelDiv.style.display = 'block';
      
      setTimeout(() => {
        const bb = betaPrimeMarkerLabelDiv.getBoundingClientRect();
        const chartRect = chartWrap.getBoundingClientRect();
        const svgRect = svg.node().getBoundingClientRect();
        
        // Calculate position relative to chart container
        const absoluteX = svgRect.left - chartRect.left + margin.left + xPos;
        const absoluteY = svgRect.top - chartRect.top + margin.top + arrowTop - 20;
        
        betaPrimeMarkerLabelDiv.style.left = (absoluteX - bb.width/2) + 'px';
        betaPrimeMarkerLabelDiv.style.top = (absoluteY - bb.height/2) + 'px';
        
        // Hide the old foreignObject label
        betaPrimeLabelFO.attr('x', -1000).attr('y', -1000);
        betaPrimeBG.attr('x', -1000).attr('y', -1000);
      }, 0);
    }
    
    betaPrimeMarkerG.raise();
  }

  function drawBetaPrimePrimeMarker(){
    const betaPrimePrimeMarkerLabelDiv = document.getElementById('betaPrimePrimeMarkerLabel');
    const showThird = (thirdDistMode === 'on');
    if(!showThird){
      betaPrimePrimeMarkerG.attr('display', 'none');
      if(betaPrimePrimeMarkerLabelDiv) betaPrimePrimeMarkerLabelDiv.style.display = 'none';
      return;
    }
    betaPrimePrimeMarkerG.attr('display', null);
    const beta3 = getBeta() + shiftUnits3;
    const xPos = x(beta3);
    const axisY = axisInsetTop;
    const arrowTop = axisY - 20;
    
    betaPrimePrimeLine.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowTop).attr('y2', axisY);
    // Make drag area cover the entire arrow with extra height
    betaPrimePrimeLineDragArea.attr('x1', xPos).attr('x2', xPos).attr('y1', arrowTop - 10).attr('y2', axisY);
    
    const labelHtml = '<div style="text-align:center;color:#f97316;font-weight:700;font-size:18px;white-space:nowrap;background:#fff;opacity:0.98;border-radius:4px;padding:2px 6px 3px 6px;" class="latex-label">' + 
      renderLatex(labelParamLatex + '\'\'') + ' = ' + beta3.toFixed(2) + '</div>';
    
    if(betaPrimePrimeMarkerLabelDiv) {
      betaPrimePrimeMarkerLabelDiv.innerHTML = labelHtml;
      betaPrimePrimeMarkerLabelDiv.style.display = 'block';
      
      setTimeout(() => {
        const bb = betaPrimePrimeMarkerLabelDiv.getBoundingClientRect();
        const chartRect = chartWrap.getBoundingClientRect();
        const svgRect = svg.node().getBoundingClientRect();
        
        // Calculate position relative to chart container
        const absoluteX = svgRect.left - chartRect.left + margin.left + xPos;
        const absoluteY = svgRect.top - chartRect.top + margin.top + arrowTop - 20;
        
        betaPrimePrimeMarkerLabelDiv.style.left = (absoluteX - bb.width/2) + 'px';
        betaPrimePrimeMarkerLabelDiv.style.top = (absoluteY - bb.height/2) + 'px';
        
        // Hide the old foreignObject label
        betaPrimePrimeLabelFO.attr('x', -1000).attr('y', -1000);
        betaPrimePrimeBG.attr('x', -1000).attr('y', -1000);
      }, 0);
    }
    
    betaPrimePrimeMarkerG.raise();
  }

  function updatePTextToRightOfB(){
    const pValueLabelDiv = document.getElementById('pValueLabel');
    
    // Only show p-value if p-value mode is on
    if(pValueMode === 'off') {
      pTextRight.attr('display','none'); 
      if(pValueLabelDiv) {
        pValueLabelDiv.style.display = 'none';
        pValueLabelDiv.style.opacity = '1';
      }
      return;
    }
    
    if(bValue === null || Number.isNaN(bValue)){ 
      pTextRight.attr('display','none'); 
      if(pValueLabelDiv) {
        pValueLabelDiv.style.display = 'none';
        pValueLabelDiv.style.opacity = '1';
      }
      return; 
    }
    
    // Show p-value only if:
    // 1. Curve is on (can use curve as statistical model), OR
    // 2. Histogram has data that's locked to beta
    const curveIsVisible = (curveMode !== 'off');
    const histogramIsLockedAndVisible = (histogramMode === 'on') && (currentN > 0) && isLockedToBeta;
    
    if(!curveIsVisible && !histogramIsLockedAndVisible){ 
      pTextRight.attr('display','none'); 
      if(pValueLabelDiv) {
        pValueLabelDiv.style.display = 'none';
        pValueLabelDiv.style.opacity = '1';
      }
      return; 
    }
    
    const beta = getBeta();
    const betaVal = beta + shiftUnits;
    const se = getSE();
    const z = (bValue - betaVal)/se;
    const absZ = Math.abs(z);

    let pOne;
    if (curveMode === 't') {
      const nu = getDf();
      pOne = 1 - cdfT(absZ, nu);
    } else {
      pOne = 1 - cdfStandard(absZ);
    }

    const pValueText = (pOne < 0.001) ? '< 0.001' : '= ' + pOne.toFixed(3);
    
    // Determine inequality based on whether b > beta or b < beta
    const inequality = bValue > betaVal ? '>' : '<';
    const bValueFormatted = Number.isInteger(bValue) ? bValue.toString() : bValue.toFixed(2).replace(/\.?0+$/, '');
    const pLabel = 'P(' + renderLatex(labelSampleStatLatex) + ' ' + inequality + ' ' + bValueFormatted + ') ' + pValueText;
    
    if(pValueLabelDiv) {
      pValueLabelDiv.innerHTML = '<div style="color:#1d4ed8;font-weight:700;font-size:18px;line-height:1.1;margin-top:-2px;" class="latex-label">' + pLabel + '</div>';
      
      // Only use opacity trick if element is currently hidden (initial display)
      const isCurrentlyHidden = pValueLabelDiv.style.display === 'none';
      
      pValueLabelDiv.style.display = 'block';
      if(isCurrentlyHidden) {
        pValueLabelDiv.style.opacity = '0'; // Hide during initial positioning only
      }
      
      // Position underneath the b marker label, centered
      const bMarkerLabelDiv = document.getElementById('bMarkerLabel');
      if(bMarkerLabelDiv && bMarkerLabelDiv.style.display !== 'none') {
        // Use requestAnimationFrame to ensure layout is complete before measuring
        requestAnimationFrame(() => {
          setTimeout(() => {
            const bLabelRect = bMarkerLabelDiv.getBoundingClientRect();
            const chartRect = chartWrap.getBoundingClientRect();
            const pLabelRect = pValueLabelDiv.getBoundingClientRect();
            
            // Center the p-value label under the b label
            const bLabelCenter = bLabelRect.left + bLabelRect.width / 2;
            pValueLabelDiv.style.left = (bLabelCenter - chartRect.left - pLabelRect.width / 2) + 'px';
            pValueLabelDiv.style.top = (bLabelRect.bottom - chartRect.top + 2) + 'px';
            
            // Show after positioning (only matters if we hid it initially)
            if(isCurrentlyHidden) {
              pValueLabelDiv.style.opacity = '1';
            }
          }, 0);
        });
      }
      
      // Hide old SVG text
      pTextRight.attr('display', 'none');
    }
  }

  function addMark(value){
    blueMarks.push({id: nextMarkId++, value: value});
    blueMarkJustPlaced = true;
    draw();
  }
  
  function clearMark(markId){
    blueMarks = blueMarks.filter(m => m.id !== markId);
    if(linkedMarks.left === markId) linkedMarks.left = null;
    if(linkedMarks.right === markId) linkedMarks.right = null;
    draw();
  }
  
  function clearAllMarks(){
    blueMarks = [];
    linkedMarks.left = null;
    linkedMarks.right = null;
    d3.selectAll('.clear-mark-btn').remove();
    draw();
  }

  function clearBlueMarks(){
    clearAllMarks();
  }

  function setXDomainAndBins(){
    setXDomain();
    const nbins = getBins();
    bins = computeBins(data, nbins);
    if(secondDistMode === 'on'){
      bins2 = computeBins(data2, nbins);
    } else {
      bins2 = [];
    }
    if(thirdDistMode === 'on'){
      bins3 = computeBins(data3, nbins);
    } else {
      bins3 = [];
    }
    recomputeYDomain(nbins);
  }

  function draw(){
    layoutStatic();
    setXDomainAndBins();
    drawAxes();
    drawHistogram();

    const beta=getBeta();
    const pxShift = x(beta + shiftUnits) - x(beta);
    const pxShift2 = x(beta + shiftUnits2) - x(beta);
    const pxShift3 = x(beta + shiftUnits3) - x(beta);
    plotWrap.attr('transform','translate(0,'+axisInsetTop+')');
    histWrap.attr('transform','translate('+pxShift+',0)');
    secondWrap.attr('transform','translate('+pxShift2+',0)');
    thirdWrap.attr('transform','translate('+pxShift3+',0)');
    
    // Calculate actual sample mean and check lock status
    let sampleMean = beta; // default to theoretical mean
    let showSampleMean = false;
    const se = getSE();
    const lockThreshold = 0.1 * se; // Scale-invariant lock threshold (10% of SE)
    
    if(currentN > 0 && data.length > 0) {
      const sum = data.reduce((acc, val) => acc + val, 0);
      sampleMean = sum / data.length;
      showSampleMean = true;
      
      // Check if should lock (but don't unlock once locked)
      // Lock when we have at least 200 samples
      if(!isLockedToBeta && currentN >= 200) {
        isLockedToBeta = true;
      }
      
      // If locked, always show at beta position
      if(isLockedToBeta) {
        sampleMean = beta;
      }
    } else if(curveMode !== 'off') {
      // No histogram data, but curve is showing - show mean at beta
      showSampleMean = true;
      sampleMean = beta;
    }
    
    const showMeanLines = showSampleMean && ((histogramMode === 'on') || (curveMode !== 'off'));
    const meanLineEnd = plotH;
    
    // Position mean line within histWrap
    // histWrap is already translated by pxShift, so we just need local coordinates
    // When locked: position at x(beta) so everything aligns
    // When not locked: position at x(sampleMean) to show actual sample mean
    const meanLineX = isLockedToBeta ? x(beta) : x(sampleMean);
    
    meanLineBg.attr('x1', meanLineX).attr('x2', meanLineX).attr('y1',0).attr('y2',meanLineEnd)
      .style('stroke', getMainColor())
      .style('display', showMeanLines ? null : 'none')
      .raise();
    meanLine.attr('x1', meanLineX).attr('x2', meanLineX).attr('y1',0).attr('y2',meanLineEnd)
      .style('display', showMeanLines ? null : 'none')
      .raise();
    
    meanLabel.attr('transform', 'translate(' + meanLineX + ',' + (meanLineEnd + 18) + ')')
      .style('display', 'none'); // Hide SVG label
    
    const meanLineLabelDiv = document.getElementById('meanLineLabel');
    if(meanLineLabelDiv) {
      meanLineLabelDiv.style.display = 'none';
    }

    const showSecond = (secondDistMode === 'on');
    if(showSecond){
      // Calculate sample mean for second distribution
      let sampleMean2 = beta;
      let showSampleMean2 = false;
      
      if(currentN > 0 && data2.length > 0) {
        const sum2 = data2.reduce((acc, val) => acc + val, 0);
        sampleMean2 = sum2 / data2.length;
        showSampleMean2 = true;
        
        // If main distribution is locked, lock second one too at beta
        if(isLockedToBeta) {
          sampleMean2 = beta;
        }
      } else if(curveMode !== 'off') {
        // No histogram data, but curve is showing - show mean at beta
        showSampleMean2 = true;
        sampleMean2 = beta;
      }
      
      const showMeanLines2 = showSampleMean2 && ((histogramMode === 'on') || (curveMode !== 'off'));
      
      // Position mean line within secondWrap (which is translated by pxShift2)
      const meanLineX2 = isLockedToBeta ? x(beta) : x(sampleMean2);
      
      meanLine2Bg.attr('x1', meanLineX2).attr('x2', meanLineX2).attr('y1',0).attr('y2',meanLineEnd)
        .style('stroke', getSecondaryColor())
        .style('display', showMeanLines2 ? null : 'none')
        .raise();
      meanLine2.attr('x1', meanLineX2).attr('x2', meanLineX2).attr('y1',0).attr('y2',meanLineEnd)
        .style('display', showMeanLines2 ? null : 'none')
        .raise();
      meanLabel2.attr('transform', 'translate(' + meanLineX2 + ',' + (meanLineEnd + 18) + ')')
        .style('display', 'none'); // Hide SVG label
      
      const meanLineLabel2Div = document.getElementById('meanLineLabel2');
      if(meanLineLabel2Div) {
        meanLineLabel2Div.style.display = 'none';
      }
    } else {
      meanLine2Bg.style('display', 'none');
      meanLine2.style('display', 'none');
      meanLabel2.style('display', 'none');
      const meanLineLabel2Div = document.getElementById('meanLineLabel2');
      if(meanLineLabel2Div) meanLineLabel2Div.style.display = 'none';
    }

    // Third distribution mean line
    if(thirdDistMode === 'on'){
      let sampleMean3 = beta;
      let showSampleMean3 = false;
      
      if(currentN > 0 && data3.length > 0) {
        const sum3 = data3.reduce((acc, val) => acc + val, 0);
        sampleMean3 = sum3 / data3.length;
        showSampleMean3 = true;
        
        // If main distribution is locked, lock third one too at beta
        if(isLockedToBeta) {
          sampleMean3 = beta;
        }
      } else if(curveMode !== 'off') {
        // No histogram data, but curve is showing - show mean at beta
        showSampleMean3 = true;
        sampleMean3 = beta;
      }
      
      const showMeanLines3 = showSampleMean3 && ((histogramMode === 'on') || (curveMode !== 'off'));
      
      // Position mean line within thirdWrap (which is translated by pxShift3)
      const meanLineX3 = isLockedToBeta ? x(beta) : x(sampleMean3);
      
      meanLine3Bg.attr('x1', meanLineX3).attr('x2', meanLineX3).attr('y1',0).attr('y2',meanLineEnd)
        .style('stroke', getSecondaryColor())
        .style('display', showMeanLines3 ? null : 'none')
        .raise();
      meanLine3.attr('x1', meanLineX3).attr('x2', meanLineX3).attr('y1',0).attr('y2',meanLineEnd)
        .style('display', showMeanLines3 ? null : 'none')
        .raise();
      meanLabel3.attr('transform', 'translate(' + meanLineX3 + ',' + (meanLineEnd + 18) + ')')
        .style('display', 'none'); // Hide SVG label
      
      const meanLineLabel3Div = document.getElementById('meanLineLabel3');
      if(meanLineLabel3Div) {
        meanLineLabel3Div.style.display = 'none';
      }
    } else {
      meanLine3Bg.style('display', 'none');
      meanLine3.style('display', 'none');
      meanLabel3.style('display', 'none');
      const meanLineLabel3Div = document.getElementById('meanLineLabel3');
      if(meanLineLabel3Div) meanLineLabel3Div.style.display = 'none';
    }

    drawBetaMarker();
    drawBetaPrimeMarker();
    drawBetaPrimePrimeMarker();
    drawBMarker();
    drawOverlay();
    drawVerticalLines();

    // Draw blue marks
    const axisY = axisInsetTop, arrowTop = axisY - 20;
    
    const markGroups = blueMarksG.selectAll('g.mark-group').data(blueMarks, d => d.id);
    markGroups.exit().remove();
    
    const newMarks = markGroups.enter().append('g').attr('class', 'mark-group').style('cursor', 'pointer');
    newMarks.append('line').attr('class', 'mark-line').attr('stroke','#1d4ed8').attr('stroke-width',3).attr('marker-end','url(#arrowDownBlue)');
    newMarks.append('rect').attr('class', 'mark-bg').attr('fill','#fff').attr('opacity',0.98).attr('rx',4).attr('ry',4);
    newMarks.append('foreignObject').attr('class', 'mark-label-fo').attr('width',200).attr('height',40);
    
    const allMarks = newMarks.merge(markGroups);
    
    allMarks.each(function(d){
      const g = d3.select(this);
      const xPos = x(d.value);
      
      g.select('.mark-line').attr('x1', xPos).attr('x2', xPos).attr('y1', arrowTop).attr('y2', axisY);
      
      const labelFO = g.select('.mark-label-fo');
      const labelHtml = '<div style="text-align:center;color:#1d4ed8;font-weight:700;font-size:18px;white-space:nowrap;" class="latex-label">' + 
        renderLatex(labelParamLatex) + ' = ' + d.value.toFixed(2) + '</div>';
      labelFO.html(labelHtml);
      
      setTimeout(() => {
        const labelDiv = labelFO.node().querySelector('div');
        if(labelDiv){
          const bb = labelDiv.getBoundingClientRect();
          labelFO.attr('x', xPos - bb.width/2).attr('y', arrowTop - 20 - bb.height/2);
          g.select('.mark-bg')
            .attr('x', xPos - bb.width/2 - 4).attr('y', arrowTop - 20 - bb.height/2 - 2)
            .attr('width', bb.width + 8).attr('height', bb.height + 4);
        }
      }, 0);
    });
    
    allMarks
      .on('mouseenter', function(event, d){
        showClearButton(d.id, d.value);
      })
      .on('mouseleave', function(event, d){
        hideClearButton(d.id);
      });

    if(blueMarkJustPlaced){
      blueMarksG.raise();
      blueMarkJustPlaced = false;
    } else {
      const showSecond = (secondDistMode === 'on');
      if(showSecond){
        betaPrimeMarkerG.raise();
      } else { 
        restoreRedBetaOnTop(); 
      }
    }

    if (!btnMarkBound.classList.contains('hidden')) {
      showMarkButton();
    }
    if (!btnMarkBound2.classList.contains('hidden')) {
      showMarkButton2();
    }
    if (!btnMarkBound3.classList.contains('hidden')) {
      showMarkButton3();
    }
    
    blueMarks.forEach(mark => {
      const btn = document.getElementById('clearBtn' + mark.id);
      if(btn && !btn.classList.contains('hidden')){
        const markX = x(mark.value);
        const topScreenY = margin.top + axisInsetTop - 28;
        btn.style.left = (margin.left + markX) + 'px';
        btn.style.top = topScreenY + 'px';
      }
    });

    if(bValue!==null && !Number.isNaN(bValue)) {
      // updatePTextToRightOfB is now called inside drawBMarker's setTimeout
    }
    
    // Update cursor styles based on lock status
    const isLocked = isSampleMeanLocked();
    const cursorStyle = isLocked ? 'grab' : 'not-allowed';
    root.select('.draggable-veil').style('cursor', cursorStyle);
    betaMarkerG.style('cursor', cursorStyle);
  }

  function regenerate(opts = {}){
    const n = getN(), beta = getBeta(), se = getSE();
    const keepShift = opts.preserveShift === true;
    const reset = opts.reset === true;
    const prevShift = shiftUnits;
    
    if(reset) {
      // Full reset - generate samples at current (possibly dragged) position
      const centerPos = keepShift ? (beta + prevShift) : beta;
      data = gaussian(n, centerPos, se);
      currentN = n;
      shiftUnits = 0; // Reset shift since samples are now at that position
    } else {
      // Append mode: generate at beta (the theoretical center)
      // shiftUnits is just for visual display, don't use it for generating samples
      const newSamples = gaussian(n, beta, se);
      data = data.concat(newSamples);
      currentN += n;
    }
    
    if(secondDistMode === 'on'){
      data2 = [...data];
    }
    
    if(thirdDistMode === 'on'){
      data3 = [...data];
    }
    
    draw();
  }

  // ---------- interactions ----------
  let dragTarget = 'main';
  
  // Helper function to check if sample mean is locked to beta
  function isSampleMeanLocked() {
    // Allow dragging if: no samples yet OR locked to beta
    return currentN === 0 || isLockedToBeta;
  }
  
  const dragHist = d3.drag()
    .on('start', function(event){
      // Only allow dragging if sample mean is locked to beta
      if(!isSampleMeanLocked()) {
        event.sourceEvent.stopPropagation();
        return;
      }
      
      hideMarkButton();
      hideMarkButton2();
      hideMarkButton3();
      d3.selectAll('.clear-mark-btn').classed('hidden', true);
      blueMarkJustPlaced = false;
      
      // Determine which distribution to drag based on proximity
      // Priority when overlapping: third > second > main (top to bottom)
      const mouseX = event.x;
      const beta1 = getBeta() + shiftUnits;
      const dist1 = Math.abs(mouseX - x(beta1));
      
      let candidates = [{name: 'main', dist: dist1, priority: 0}];
      
      if(secondDistMode === 'on'){
        const beta2 = getBeta() + shiftUnits2;
        const dist2 = Math.abs(mouseX - x(beta2));
        candidates.push({name: 'second', dist: dist2, priority: 1});
      }
      
      if(thirdDistMode === 'on'){
        const beta3 = getBeta() + shiftUnits3;
        const dist3 = Math.abs(mouseX - x(beta3));
        candidates.push({name: 'third', dist: dist3, priority: 2});
      }
      
      // Sort by distance first, then by priority (higher priority wins when distances are close)
      candidates.sort((a, b) => {
        const distDiff = a.dist - b.dist;
        // If distances are within 60 pixels, use priority (z-order) to grab the top distribution
        if(Math.abs(distDiff) < 60) {
          return b.priority - a.priority; // Higher priority first
        }
        return distDiff; // Otherwise use distance
      });
      
      dragTarget = candidates[0].name;
      
      emitTutorialEvent('dragStart', {target: dragTarget, shiftUnits: shiftUnits, shiftUnits2: shiftUnits2, shiftUnits3: shiftUnits3});
    })
    .on('drag', function(event){
      if(!isSampleMeanLocked()) return;
      
      const dx = event.dx * dataUnitsPerPx();
      
      if(dragTarget === 'second'){
        shiftUnits2 += dx;
      } else if(dragTarget === 'third'){
        shiftUnits3 += dx;
      } else {
        // When dragging main distribution while locked, just shift the histogram view
        shiftUnits += dx;
        
        if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
          vertLinesAttachment = 'cutoffs';
          linkedMarks.left = null;
          linkedMarks.right = null;
        }
      }
      draw();
      
      emitTutorialEvent('drag', {target: dragTarget, shiftUnits: shiftUnits, shiftUnits2: shiftUnits2, shiftUnits3: shiftUnits3});
    })
    .on('end', function(event){
      if(!isSampleMeanLocked()) return;
      
      emitTutorialEvent('dragEnd', {target: dragTarget, shiftUnits: shiftUnits, shiftUnits2: shiftUnits2, shiftUnits3: shiftUnits3});
    });

  const dragB = d3.drag()
    .on('start', function(){
      if(vertLinesMode === 'on' && vertLinesAttachment !== 'b'){
        const beta = getBeta();
        const betaShifted = beta + shiftUnits;
        const se = getSE();
        const crit = ciCrit(ciMode, curveMode, getDf());
        const cutL = betaShifted - crit*se;
        const cutR = betaShifted + crit*se;
        
        if(bValue !== null && !Number.isNaN(bValue)){
          const tolerance = 2 * dataUnitsPerPx();
          
          if(blueMarks.length === 2){
            const sortedMarks = [...blueMarks].sort((a, b) => a.value - b.value);
            const leftMark = sortedMarks[0];
            const rightMark = sortedMarks[1];
            
            const leftAligned = Math.abs(leftMark.value - cutL) < tolerance;
            const rightAligned = Math.abs(rightMark.value - cutR) < tolerance;
            
            const midpoint = (leftMark.value + rightMark.value) / 2;
            const bInMiddle = Math.abs(bValue - midpoint) < tolerance;
            
            if(leftAligned && rightAligned && bInMiddle){
              vertLineDistFromB.left = bValue - cutL;
              vertLineDistFromB.right = cutR - bValue;
              vertLinesAttachment = 'b';
              
              linkedMarks.left = leftMark.id;
              linkedMarks.right = rightMark.id;
            }
          }
        }
      }
      
      emitTutorialEvent('dragBStart', {bValue: bValue});
    })
    .on('drag', function(event){
      if(bValue===null) bValue = 0;
      bValue += event.dx * dataUnitsPerPx();
      bInput.value = bValue.toFixed(2);
      draw();
      
      emitTutorialEvent('dragB', {bValue: bValue});
    })
    .on('end', function(){
      emitTutorialEvent('dragBEnd', {bValue: bValue});
    });
  
  root.select('.draggable-veil').call(dragHist);
  bMarkerG.call(dragB);
  
  const dragBeta = d3.drag()
    .on('start', function(){
      // Only allow dragging if sample mean is locked to beta
      if(!isSampleMeanLocked()) {
        return;
      }
      
      hideMarkButton();
      hideMarkButton2();
      hideMarkButton3();
      d3.selectAll('.clear-mark-btn').classed('hidden', true);
      blueMarkJustPlaced = false;
      dragTarget = 'main';
      betaMarkerG.style('cursor', 'grabbing');
      
      emitTutorialEvent('dragBetaStart', {shiftUnits: shiftUnits});
    })
    .on('drag', function(event){
      if(!isSampleMeanLocked()) return;
      
      const dx = event.dx * dataUnitsPerPx();
      
      // When dragging beta marker while locked, just shift the histogram view
      shiftUnits += dx;
      
      if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
        vertLinesAttachment = 'cutoffs';
        linkedMarks.left = null;
        linkedMarks.right = null;
      }
      draw();
      
      emitTutorialEvent('dragBeta', {shiftUnits: shiftUnits});
    })
    .on('end', function(){
      betaMarkerG.style('cursor', 'grab');
      
      emitTutorialEvent('dragBetaEnd', {shiftUnits: shiftUnits});
    });
  
  betaMarkerG.call(dragBeta);
  
  const dragBetaPrime = d3.drag()
    .on('start', function(){
      hideMarkButton();
      hideMarkButton2();
      hideMarkButton3();
      d3.selectAll('.clear-mark-btn').classed('hidden', true);
      blueMarkJustPlaced = false;
      dragTarget = 'second';
      betaPrimeMarkerG.style('cursor', 'grabbing');
      
      emitTutorialEvent('dragBetaPrimeStart', {shiftUnits2: shiftUnits2});
    })
    .on('drag', function(event){
      shiftUnits2 += event.dx * dataUnitsPerPx();
      draw();
      
      emitTutorialEvent('dragBetaPrime', {shiftUnits2: shiftUnits2});
    })
    .on('end', function(){
      betaPrimeMarkerG.style('cursor', 'grab');
      
      emitTutorialEvent('dragBetaPrimeEnd', {shiftUnits2: shiftUnits2});
    });
  
  betaPrimeMarkerG.call(dragBetaPrime);

  const dragBetaPrimePrime = d3.drag()
    .on('start', function(){
      hideMarkButton();
      hideMarkButton2();
      hideMarkButton3();
      d3.selectAll('.clear-mark-btn').classed('hidden', true);
      blueMarkJustPlaced = false;
      dragTarget = 'third';
      betaPrimePrimeMarkerG.style('cursor', 'grabbing');
      
      emitTutorialEvent('dragBetaPrimePrimeStart', {shiftUnits3: shiftUnits3});
    })
    .on('drag', function(event){
      shiftUnits3 += event.dx * dataUnitsPerPx();
      draw();
      
      emitTutorialEvent('dragBetaPrimePrime', {shiftUnits3: shiftUnits3});
    })
    .on('end', function(){
      betaPrimePrimeMarkerG.style('cursor', 'grab');
      
      emitTutorialEvent('dragBetaPrimePrimeEnd', {shiftUnits3: shiftUnits3});
    });
  
  betaPrimePrimeMarkerG.call(dragBetaPrimePrime);

  // Drag behavior for axes to pan the view
  const dragAxis = d3.drag()
    .on('start', function(){
      emitTutorialEvent('dragAxisStart', {domainOffset: domainOffset});
    })
    .on('drag', function(event){
      domainOffset += event.dx * dataUnitsPerPx();
      draw();
      
      emitTutorialEvent('dragAxis', {domainOffset: domainOffset});
    })
    .on('end', function(){
      emitTutorialEvent('dragAxisEnd', {domainOffset: domainOffset});
    });
  
  xAxisG.call(dragAxis);
  xAxisTopG.call(dragAxis);

  function showMarkButton(){
    btnMarkBound.textContent = 'Mark Bound';
    const beta = getBeta();
    const betaVal = beta + shiftUnits;
    const betaX = x(betaVal);
    const topScreenY = margin.top + axisInsetTop - 28;
    btnMarkBound.style.left = (margin.left + betaX) + 'px';
    btnMarkBound.style.top  = topScreenY + 'px';
    btnMarkBound.classList.remove('hidden');
  }
  function hideMarkButton(){ btnMarkBound.classList.add('hidden'); }

  function showMarkButton2(){
    btnMarkBound2.textContent = 'Mark Bound';
    const beta2 = getBeta() + shiftUnits2;
    const beta2X = x(beta2);
    const topScreenY = margin.top + axisInsetTop - 28;
    btnMarkBound2.style.left = (margin.left + beta2X) + 'px';
    btnMarkBound2.style.top  = topScreenY + 'px';
    btnMarkBound2.classList.remove('hidden');
  }
  function hideMarkButton2(){ btnMarkBound2.classList.add('hidden'); }

  function showMarkButton3(){
    btnMarkBound3.textContent = 'Mark Bound';
    const beta3 = getBeta() + shiftUnits3;
    const beta3X = x(beta3);
    const topScreenY = margin.top + axisInsetTop - 28;
    btnMarkBound3.style.left = (margin.left + beta3X) + 'px';
    btnMarkBound3.style.top  = topScreenY + 'px';
    btnMarkBound3.classList.remove('hidden');
  }
  function hideMarkButton3(){ btnMarkBound3.classList.add('hidden'); }
  
  function showClearButton(markId, markValue){
    const existingBtn = document.getElementById('clearBtn' + markId);
    if(existingBtn){
      existingBtn.classList.remove('hidden');
      return;
    }
    
    const btn = document.createElement('button');
    btn.id = 'clearBtn' + markId;
    btn.className = 'overlay-btn clear-mark-btn';
    btn.textContent = 'Clear';
    btn.style.position = 'absolute';
    btn.style.zIndex = '2';
    btn.style.transform = 'translate(-50%, 0)';
    
    const markX = x(markValue);
    const topScreenY = margin.top + axisInsetTop - 28;
    btn.style.left = (margin.left + markX) + 'px';
    btn.style.top = topScreenY + 'px';
    
    btn.addEventListener('mouseenter', () => {
      btn.classList.remove('hidden');
    });
    btn.addEventListener('mouseleave', () => {
      btn.classList.add('hidden');
    });
    btn.addEventListener('click', () => {
      clearMark(markId);
      btn.remove();
    });
    
    chartWrap.appendChild(btn);
  }
  
  function hideClearButton(markId){
    const btn = document.getElementById('clearBtn' + markId);
    if(btn){
      btn.classList.add('hidden');
    }
  }

  betaMarkerG
    .style('pointer-events', 'all')
    .on('mouseenter', function(){
      showMarkButton();
    })
    .on('mouseleave', function(e){
      const to = e.relatedTarget;
      if (!(to && to.id === 'btnMarkBound')) hideMarkButton();
    });

  betaPrimeMarkerG
    .style('pointer-events', 'all')
    .on('mouseenter', function(){
      showMarkButton2();
    })
    .on('mouseleave', function(e){
      const to = e.relatedTarget;
      if (!(to && to.id === 'btnMarkBound2')) hideMarkButton2();
    });

  betaPrimePrimeMarkerG
    .style('pointer-events', 'all')
    .on('mouseenter', function(){
      showMarkButton3();
    })
    .on('mouseleave', function(e){
      const to = e.relatedTarget;
      if (!(to && to.id === 'btnMarkBound3')) hideMarkButton3();
    });

  btnMarkBound.addEventListener('mouseenter', showMarkButton);
  btnMarkBound.addEventListener('mouseleave', hideMarkButton);
  btnMarkBound.addEventListener('click', function(){
    const beta = getBeta();
    const betaVal = beta + shiftUnits;
    addMark(betaVal);
    hideMarkButton();
  });

  btnMarkBound2.addEventListener('mouseenter', showMarkButton2);
  btnMarkBound2.addEventListener('mouseleave', hideMarkButton2);
  btnMarkBound2.addEventListener('click', function(){
    const beta2 = getBeta() + shiftUnits2;
    addMark(beta2);
    hideMarkButton2();
  });

  btnMarkBound3.addEventListener('mouseenter', showMarkButton3);
  btnMarkBound3.addEventListener('mouseleave', hideMarkButton3);
  btnMarkBound3.addEventListener('click', function(){
    const beta3 = getBeta() + shiftUnits3;
    addMark(beta3);
    hideMarkButton3();
  });

  // Controls
  binsRange.addEventListener('input', function() {
    emitTutorialEvent('changeBins', {value: +binsRange.value});
    draw();
  });

  seRange.addEventListener('input', function(){
    const oldSE = previousSE;
    seInput.value = +seRange.value;
    const newSE = +seRange.value;
    
    if(vertLinesMode === 'on' && vertLinesAttachment === 'b' && oldSE > 0){
      const ratio = newSE / oldSE;
      vertLineDistFromB.left *= ratio;
      vertLineDistFromB.right *= ratio;
    }
    
    previousSE = newSE;
    emitTutorialEvent('changeSE', {value: newSE});
    
    // If we have existing samples, regenerate them with the new SE
    // Always regenerate at beta (not beta + shiftUnits) since the shift is applied visually
    if(currentN > 0) {
      const beta = getBeta();
      data = gaussian(currentN, beta, newSE);
      if(secondDistMode === 'on'){
        data2 = [...data];
      }
      if(thirdDistMode === 'on'){
        data3 = [...data];
      }
    }
    
    draw();
  });

  seInput.addEventListener('change', function(){
    // Revert to previous value if they didn't hit Enter
    seInput.value = previousSE;
    seRange.value = previousSE;
    updateSESliderRange();
  });

  seInput.addEventListener('keydown', function(e){
    if(e.key !== 'Enter') return;
    
    const oldSE = previousSE;
    const newSE = getSE();
    const beta = getBeta();
    const se = newSE;
    
    domainOffset = 0;
    fixedDomain = [beta - 8*se, beta + 8*se];

    const scaleSpan = 16 * se;
    const equivalentScale = scaleSpan / 10;
    const newScaleMax = Math.max(3, Math.min(50, Math.ceil(equivalentScale * 1.5)));
    scaleRange.max = newScaleMax;
    scaleRange.step = newScaleMax > 10 ? 0.5 : 0.1;
    scaleRange.value = Math.min(equivalentScale, newScaleMax);

    updateSESliderRange();
    
    if(vertLinesMode === 'on' && vertLinesAttachment === 'b' && oldSE > 0){
      const ratio = newSE / oldSE;
      vertLineDistFromB.left *= ratio;
      vertLineDistFromB.right *= ratio;
    }
    
    previousSE = newSE;
    emitTutorialEvent('changeSE', {value: newSE});
    
    // If we have existing samples, regenerate them with the new SE
    // Always regenerate at beta (not beta + shiftUnits) since the shift is applied visually
    if(currentN > 0) {
      data = gaussian(currentN, beta, newSE);
      if(secondDistMode === 'on'){
        data2 = [...data];
      }
      if(thirdDistMode === 'on'){
        data3 = [...data];
      }
    }
    
    draw();
  });

  scaleRange.addEventListener('input', function(){
    if (fixedDomain) {
      const currentSpan = fixedDomain[1] - fixedDomain[0];
      const neededScale = currentSpan / 10;
      const newMax = Math.max(3, Math.min(50, Math.ceil(neededScale * 1.5)));
      scaleRange.max = newMax;
      scaleRange.step = newMax > 10 ? 0.5 : 0.1;
      scaleRange.value = Math.min(neededScale, newMax);
    }
    fixedDomain = null;
    domainOffset = 0;
    emitTutorialEvent('changeScale', {value: +scaleRange.value});
    draw();
  });

  betaInput.addEventListener('change', function(){
    const v = betaInput.value.trim();
    const newBetaValue = (v===''?null:+v);
    
    // If locked, adjust shiftUnits like a drag would
    if(isLockedToBeta && betaValue !== null && newBetaValue !== null) {
      const currentDisplayPosition = betaValue + shiftUnits;
      const delta = newBetaValue - currentDisplayPosition;
      shiftUnits += delta;
      // Update input to show the new displayed position
      betaInput.value = (betaValue + shiftUnits).toFixed(2);
      
      if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
        vertLinesAttachment = 'cutoffs';
        linkedMarks.left = null;
        linkedMarks.right = null;
      }
      draw();
      return;
    }
    
    // Not locked - just update betaValue and reset shift
    betaValue = newBetaValue;
    shiftUnits = 0; // Reset any previous drag offset
    
    // Only recenter if the new beta value is outside the current visible domain
    if(newBetaValue !== null && !Number.isNaN(newBetaValue)) {
      const currentDomain = x.domain();
      const isVisible = newBetaValue >= currentDomain[0] && newBetaValue <= currentDomain[1];
      
      if(!isVisible) {
        // Beta is outside visible range - recenter on it
        fixedDomain = null;
        domainOffset = 0;
      }
      // Otherwise, keep current domain and just show the marker
    }
    
    if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
      vertLinesAttachment = 'cutoffs';
      linkedMarks.left = null;
      linkedMarks.right = null;
    }
    draw();
  });

  betaBtn.addEventListener('click', function(){
    const v = betaInput.value.trim();
    const newBetaValue = (v===''?null:+v);
    
    // If locked (has samples that are locked to beta), adjust shiftUnits like a drag would
    if(isLockedToBeta && currentN > 0 && newBetaValue !== null) {
      const beta = getBeta(); // Get current beta (could be null->0 or actual value)
      const currentDisplayPosition = beta + shiftUnits;
      const delta = newBetaValue - currentDisplayPosition;
      shiftUnits += delta;
      // Update input to show the new displayed position
      betaInput.value = (getBeta() + shiftUnits).toFixed(2);
      
      if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
        vertLinesAttachment = 'cutoffs';
        linkedMarks.left = null;
        linkedMarks.right = null;
      }
      emitTutorialEvent('changeBeta', {value: newBetaValue});
      draw();
      return;
    }
    
    // Not locked - set beta directly and reset shift
    betaValue = newBetaValue;
    shiftUnits = 0; // Reset any previous drag offset
    
    // Only recenter if the new beta value is outside the current visible domain
    if(newBetaValue !== null && !Number.isNaN(newBetaValue)) {
      const currentDomain = x.domain();
      const isVisible = newBetaValue >= currentDomain[0] && newBetaValue <= currentDomain[1];
      
      if(!isVisible) {
        // Beta is outside visible range - recenter on it
        fixedDomain = null;
        domainOffset = 0;
      }
      // Otherwise, keep current domain and just show the marker
    }
    
    if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
      vertLinesAttachment = 'cutoffs';
      linkedMarks.left = null;
      linkedMarks.right = null;
    }
    emitTutorialEvent('changeBeta', {value: newBetaValue});
    draw();
  });

  betaInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      const v = betaInput.value.trim();
      const newBetaValue = (v===''?null:+v);
      
      // If locked (has samples that are locked to beta), adjust shiftUnits like a drag would
      if(isLockedToBeta && currentN > 0 && newBetaValue !== null) {
        const beta = getBeta(); // Get current beta (could be null->0 or actual value)
        const currentDisplayPosition = beta + shiftUnits;
        const delta = newBetaValue - currentDisplayPosition;
        shiftUnits += delta;
        // Update input to show the new displayed position
        betaInput.value = (getBeta() + shiftUnits).toFixed(2);
        
        if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
          vertLinesAttachment = 'cutoffs';
          linkedMarks.left = null;
          linkedMarks.right = null;
        }
        draw();
        return;
      }
      
      // Not locked - set beta directly and reset shift
      betaValue = newBetaValue;
      shiftUnits = 0; // Reset any previous drag offset
      
      // Only recenter if the new beta value is outside the current visible domain
      if(newBetaValue !== null && !Number.isNaN(newBetaValue)) {
        const currentDomain = x.domain();
        const isVisible = newBetaValue >= currentDomain[0] && newBetaValue <= currentDomain[1];
        
        if(!isVisible) {
          // Beta is outside visible range - recenter on it
          fixedDomain = null;
          domainOffset = 0;
        }
        // Otherwise, keep current domain and just show the marker
      }
      
      if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
        vertLinesAttachment = 'cutoffs';
        linkedMarks.left = null;
        linkedMarks.right = null;
      }
      draw();
    }
  });

  // Dropdown functionality for Simulate button
  const regenDropdownBtn = document.getElementById('regenDropdownBtn');
  const regenDropdown = document.getElementById('regenDropdown');
  
  // Function to update button text
  function updateSimulateButtonText() {
    regenBtn.textContent = `Simulate ${nValue}x`;
  }
  
  // Toggle dropdown
  regenDropdownBtn.addEventListener('click', function(e){
    e.stopPropagation();
    regenDropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e){
    if(!e.target.closest('.dropdown-btn-wrap')){
      regenDropdown.classList.remove('show');
    }
  });
  
  // Dropdown menu item selection
  regenDropdown.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-n], button[data-action]');
    if(!btn) return;
    
    // Handle Clear action
    if(btn.getAttribute('data-action') === 'clear') {
      data = [];
      data2 = [];
      data3 = [];
      currentN = 0;
      blueMarks = [];
      isLockedToBeta = false;
      draw();
      emitTutorialEvent('clearData', {});
      regenDropdown.classList.remove('show');
      return;
    }
    
    // Handle n value selection
    nValue = parseInt(btn.getAttribute('data-n'));
    updateSimulateButtonText();
    
    // Update active state
    regenDropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    emitTutorialEvent('changeN', {value: nValue});
    regenDropdown.classList.remove('show');
  });
  
  // Initialize based on current nValue
  const activeBtn = regenDropdown.querySelector(`button[data-n="${nValue}"]`);
  if(activeBtn) {
    activeBtn.classList.add('active');
    updateSimulateButtonText();
  }

  bBtn.addEventListener('click', function(){
    const v = bInput.value.trim();
    bValue = (v===''?null:+v);
    emitTutorialEvent('changeB', {value: bValue});
    draw();
  });

  bInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      const v = bInput.value.trim();
      bValue = (v===''?null:+v);
      emitTutorialEvent('changeB', {value: bValue});
      draw();
    }
  });

  regenBtn.addEventListener('click', function(){
    // Check if beta is set before allowing simulation
    if(betaValue === null || Number.isNaN(betaValue)){
      alert('You must set a value for the population parameter in order to simulate a sample.');
      return;
    }
    
    // Auto-enable histogram if it's currently off
    if(histogramMode === 'off'){
      histogramMode = 'on';
      histogramBtn.classList.add('active');
    }
    
    if(currentN === 0) {
      // First simulation - do full reset and setup
      const beta = getBeta();
      const se = getSE();
      
      // If beta was dragged before simulation, keep the current view and update betaValue
      if(shiftUnits !== 0) {
        // Capture current domain to preserve the view
        const currentDomain = x.domain();
        fixedDomain = [currentDomain[0], currentDomain[1]];
        
        // Update betaValue to the new position
        betaValue = beta + shiftUnits;
        betaInput.value = betaValue.toFixed(2);
      } else {
        // Check if beta is visible in current domain
        const currentDomain = x.domain();
        const isVisible = beta >= currentDomain[0] && beta <= currentDomain[1];
        
        if(isVisible) {
          // Beta is visible - keep current domain
          fixedDomain = [currentDomain[0], currentDomain[1]];
        } else {
          // Beta is not visible - center on beta
          fixedDomain = [beta - 8*se, beta + 8*se];
        }
      }
      
      domainOffset = 0;
      isLockedToBeta = false; // Reset lock state for new simulation

      const scaleSpan = 16 * se;
      const equivalentScale = scaleSpan / 10;
      const newScaleMax = Math.max(3, Math.min(50, Math.ceil(equivalentScale * 1.5)));
      scaleRange.max = newScaleMax;
      scaleRange.step = newScaleMax > 10 ? 0.5 : 0.1;
      scaleRange.value = Math.min(equivalentScale, newScaleMax);

      seInput.value = se;
      setTimeout(updateSESliderRange, 0);
      if(vertLinesMode === 'on' && vertLinesAttachment === 'b'){
        vertLinesAttachment = 'cutoffs';
        linkedMarks.left = null;
        linkedMarks.right = null;
      }
      // Don't use preserveShift since we've already updated betaValue to include the shift
      regenerate({ reset: true });
      emitTutorialEvent('simulate', {n: nValue, reset: true});
      
    } else {
      // Subsequent simulations - just append
      regenerate();
      emitTutorialEvent('simulate', {n: nValue, reset: false});
      
    }
    updateSimulateButtonText();
  });

  curveSeg.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-curve]'); if(!btn) return;
    const oldCurveMode = curveMode;
    const newCurveMode = btn.getAttribute('data-curve');
    
    console.log('=== CURVE BUTTON CLICKED ===');
    console.log('oldCurveMode:', oldCurveMode);
    console.log('newCurveMode:', newCurveMode);
    
    // Check if beta is set before allowing curve to be shown
    if(newCurveMode !== 'off' && (betaValue === null || Number.isNaN(betaValue))){
      alert('You must set a value for the population parameter in order to show a curve.');
      return;
    }
    
    curveSeg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    curveMode = newCurveMode;
    
    console.log('curveMode after update:', curveMode);
    console.log('About to call draw()...');
    
    if(vertLinesMode === 'on' && vertLinesAttachment === 'b' && oldCurveMode !== curveMode){
      vertLinesAttachment = 'cutoffs';
      linkedMarks.left = null;
      linkedMarks.right = null;
    }
    emitTutorialEvent('changeCurve', {value: curveMode});
    draw();
    
    console.log('=== END CURVE BUTTON ===');
  });

  dfInput.addEventListener('change', function(){
    if(vertLinesMode === 'on' && vertLinesAttachment === 'b' && curveMode === 't'){
      vertLinesAttachment = 'cutoffs';
      linkedMarks.left = null;
      linkedMarks.right = null;
    }
    emitTutorialEvent('changeDf', {value: +dfInput.value});
    if (curveMode === 't') draw();
  });

  secondDistBtn.addEventListener('click', function(){
    if(secondDistMode === 'off'){
      secondDistMode = 'on';
      secondDistBtn.classList.add('active');
      shiftUnits2 = shiftUnits;
      data2 = [...data];
    } else {
      secondDistMode = 'off';
      secondDistBtn.classList.remove('active');
      data2 = [];
      bins2 = [];
    }
    emitTutorialEvent('toggleSecondDist', {value: secondDistMode});
    draw();
  });
  
  if(thirdDistBtn) {
    thirdDistBtn.addEventListener('click', function(){
      // Don't allow toggling on in power mode
      if(powerMode === 'power' && thirdDistMode === 'off'){
        return;
      }
      
      if(thirdDistMode === 'off'){
        thirdDistMode = 'on';
        thirdDistBtn.classList.add('active');
        shiftUnits3 = shiftUnits; // Start on top of current beta position
        data3 = [...data];
      } else {
        thirdDistMode = 'off';
        thirdDistBtn.classList.remove('active');
        data3 = [];
        bins3 = [];
      }
      emitTutorialEvent('toggleThirdDist', {value: thirdDistMode});
      draw();
    });
  }
  
  powerSeg.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-power]'); if(!btn) return;
    powerSeg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    powerMode = btn.getAttribute('data-power');
    
    // When switching to power mode, turn off third distribution
    if(powerMode === 'power' && thirdDistMode === 'on'){
      thirdDistMode = 'off';
      if(thirdDistBtn) thirdDistBtn.classList.remove('active');
      data3 = [];
      bins3 = [];
    }
    
    // Update button appearance based on mode
    if(thirdDistBtn) {
      if(powerMode === 'power'){
        thirdDistBtn.style.opacity = '0.5';
        thirdDistBtn.style.cursor = 'not-allowed';
        thirdDistBtn.title = 'Third distribution not available in power mode';
      } else {
        thirdDistBtn.style.opacity = '1';
        thirdDistBtn.style.cursor = 'pointer';
        thirdDistBtn.title = 'Toggle third distribution';
      }
    }
    
    emitTutorialEvent('changePowerMode', {value: powerMode});
    draw();
  });

  vertLinesBtn.addEventListener('click', function(){
    if(vertLinesMode === 'off'){
      vertLinesMode = 'on';
      vertLinesBtn.classList.add('active');
      vertLinesAttachment = 'cutoffs';
      linkedMarks.left = null;
      linkedMarks.right = null;
    } else {
      vertLinesMode = 'off';
      vertLinesBtn.classList.remove('active');
      linkedMarks.left = null;
      linkedMarks.right = null;
    }
    emitTutorialEvent('toggleVertLines', {value: vertLinesMode});
    draw();
  });

  histogramBtn.addEventListener('click', function(){
    if(histogramMode === 'on'){
      histogramMode = 'off';
      histogramBtn.classList.remove('active');
    } else {
      // Check if beta is set before allowing histogram
      if(betaValue === null || Number.isNaN(betaValue)){
        alert('You must enter a value for the population parameter in order to generate a histogram.');
        return;
      }
      
      histogramMode = 'on';
      histogramBtn.classList.add('active');
      
      // Auto-generate samples if we don't have samples yet
      if(currentN === 0) {
        const beta = getBeta();
        const se = getSE();
        data = gaussian(1000, beta, se);
        currentN = 1000;
        isLockedToBeta = true;
        
        // Also generate for second distribution if it's on
        if(secondDistMode === 'on') {
          data2 = [...data];
        }
        
        // Also generate for third distribution if it's on
        if(thirdDistMode === 'on') {
          data3 = [...data];
        }
      }
    }
    emitTutorialEvent('toggleHistogram', {value: histogramMode});
    draw();
  });

  pValueBtn.addEventListener('click', function(){
    if(pValueMode === 'on'){
      pValueMode = 'off';
      pValueBtn.classList.remove('active');
    } else {
      pValueMode = 'on';
      pValueBtn.classList.add('active');
    }
    emitTutorialEvent('togglePValue', {value: pValueMode});
    draw();
  });

  ciSeg.addEventListener('click', function(e){
    const btn=e.target.closest('button[data-ci]'); if(!btn) return;
    ciSeg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); 
    const oldCiMode = ciMode;
    ciMode = btn.getAttribute('data-ci');
    if(ciMode === 'off'){ clearBlueMarks(); }
    if(vertLinesMode === 'on' && vertLinesAttachment === 'b' && oldCiMode !== ciMode){
      vertLinesAttachment = 'cutoffs';
      linkedMarks.left = null;
      linkedMarks.right = null;
    }
    emitTutorialEvent('changeCI', {value: ciMode});
    draw();
  });

  function rescale(){
    width = chartWrap.clientWidth; height = chartWrap.clientHeight;
    innerW = width - margin.left - margin.right;
    innerH = height - margin.top - margin.bottom;
    svg.attr('width',width).attr('height',height);
    layoutStatic();
    draw();
  }
  new ResizeObserver(() => { rescale(); }).observe(chartWrap);

  // Initialize b and beta values from URL if provided, otherwise set to null
  if(urlB !== null) {
    const bVal = parseFloat(urlB);
    bInput.value = bVal;
    bValue = bVal;
  } else {
    bInput.value = '';
    bValue = null;
  }
  
  // Beta was already initialized earlier in URL parameter section
  
  // Only set default bins if not specified via URL
  if(urlBins === null) {
    binsRange.value = 30;
  }

  (function initDomainAndSliders(){
    const beta = getBeta();
    const se = getSE();
    domainOffset = 0;
    
    // Determine center point based on what's specified
    let centerPoint = beta; // default to beta (or 0 if beta not specified)
    
    if(betaValue !== null && !Number.isNaN(betaValue) && bValue !== null && !Number.isNaN(bValue)) {
      // Both specified - center between them
      centerPoint = (betaValue + bValue) / 2;
    } else if(bValue !== null && !Number.isNaN(bValue)) {
      // Only b specified - center on b
      centerPoint = bValue;
    } else if(betaValue !== null && !Number.isNaN(betaValue)) {
      // Only beta specified - center on beta
      centerPoint = betaValue;
    }
    // else: neither specified, centerPoint stays at 0 (from getBeta())
    
    fixedDomain = [centerPoint - 8*se, centerPoint + 8*se];
    const scaleSpan = 16 * se;
    const equivalentScale = scaleSpan / 10;
    const newScaleMax = Math.max(3, Math.min(50, Math.ceil(equivalentScale * 1.5)));
    scaleRange.max = newScaleMax;
    scaleRange.step = newScaleMax > 10 ? 0.5 : 0.1;
    scaleRange.value = Math.min(equivalentScale, newScaleMax);
    updateSESliderRange();
  })();

  // Initialize with empty data (user will click Simulate to build it up)
  currentN = 0;
  isLockedToBeta = false;
  data = [];
  data2 = [];
  
  // Generate sampling distribution if histogram is on from URL
  if(betaValue !== null && !Number.isNaN(betaValue) && histogramMode === 'on') {
    const se = getSE();
    const beta = getBeta();
    data = gaussian(1000, beta, se);
    currentN = 1000;
    isLockedToBeta = true;
  }
  
  draw();
  
  // Tutorial API - comprehensive state management for recording/playback
  let tutorialEventListeners = [];

  function emitTutorialEvent(action, params) {
    const event = {
      action: action,
      params: params,
      timestamp: Date.now()
    };
    tutorialEventListeners.forEach(callback => {
      try {
        callback(event);
      } catch(e) {
        console.error('Tutorial event listener error:', e);
      }
    });
  }
  
  window.tutorialAPI = {
    // Get complete app state
    getState: function() {
      return {
        beta: betaValue,
        se: +seInput.value,
        b: bValue,
        simulateN: nValue,
        secondDist: secondDistMode === 'on',
        thirdDist: thirdDistMode === 'on',
        powerMode: powerMode,
        scale: +scaleRange.value,
        bins: +binsRange.value,
        curve: curveMode,
        df: +dfInput.value,
        ci: ciMode,
        vertLines: vertLinesMode === 'on',
        histogram: histogramMode === 'on',
        pValue: pValueMode === 'on',
        shiftUnits: shiftUnits,
        shiftUnits2: shiftUnits2,
        shiftUnits3: shiftUnits3,
        currentN: currentN,
        isLockedToBeta: isLockedToBeta,
        domainOffset: domainOffset,
        fixedDomain: fixedDomain,
        data: [...data],
        data2: [...data2],
        data3: [...data3],
        blueMarks: blueMarks.map(m => ({...m})),
        vertLinesAttachment: vertLinesAttachment,
        vertLineDistFromB: {...vertLineDistFromB},
        linkedMarks: {...linkedMarks},
        previousSE: previousSE
      };
    },
    
    // Set complete app state (for playback)
    setState: function(state) {
      // Set all control values
      if(state.beta !== undefined) {
        betaValue = state.beta;
        betaInput.value = state.beta !== null ? state.beta : '';
      }
      if(state.se !== undefined) {
        seInput.value = state.se;
        seRange.value = state.se;
        updateSESliderRange();
      }
      if(state.b !== undefined) {
        bValue = state.b;
        bInput.value = state.b !== null ? state.b : '';
      }
      if(state.simulateN !== undefined) {
        nValue = state.simulateN;
        updateSimulateButtonText();
        const btn = regenDropdown.querySelector('button[data-n="' + nValue + '"]');
        if(btn) {
          regenDropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      }
      if(state.secondDist !== undefined) {
        secondDistMode = state.secondDist ? 'on' : 'off';
        if(state.secondDist) {
          secondDistBtn.classList.add('active');
        } else {
          secondDistBtn.classList.remove('active');
        }
      }
      if(state.thirdDist !== undefined) {
        thirdDistMode = state.thirdDist ? 'on' : 'off';
        if(state.thirdDist) {
          thirdDistBtn.classList.add('active');
        } else {
          thirdDistBtn.classList.remove('active');
        }
      }
      if(state.powerMode !== undefined) {
        powerMode = state.powerMode;
        powerSeg.querySelectorAll('button').forEach(b => {
          b.classList.remove('active');
          if(b.getAttribute('data-power') === powerMode) {
            b.classList.add('active');
          }
        });
      }
      if(state.scale !== undefined) {
        scaleRange.value = state.scale;
      }
      if(state.bins !== undefined) {
        binsRange.value = state.bins;
      }
      if(state.curve !== undefined) {
        curveMode = state.curve;
        curveSeg.querySelectorAll('button').forEach(b => {
          b.classList.remove('active');
          if(b.getAttribute('data-curve') === curveMode) {
            b.classList.add('active');
          }
        });
      }
      if(state.df !== undefined) {
        dfInput.value = state.df;
      }
      if(state.ci !== undefined) {
        ciMode = state.ci;
        ciSeg.querySelectorAll('button').forEach(b => {
          b.classList.remove('active');
          if(b.getAttribute('data-ci') === ciMode) {
            b.classList.add('active');
          }
        });
      }
      if(state.vertLines !== undefined) {
        vertLinesMode = state.vertLines ? 'on' : 'off';
        if(state.vertLines) {
          vertLinesBtn.classList.add('active');
        } else {
          vertLinesBtn.classList.remove('active');
        }
      }
      if(state.histogram !== undefined) {
        histogramMode = state.histogram ? 'on' : 'off';
        if(state.histogram) {
          histogramBtn.classList.add('active');
        } else {
          histogramBtn.classList.remove('active');
        }
      }
      if(state.pValue !== undefined) {
        pValueMode = state.pValue ? 'on' : 'off';
        if(state.pValue) {
          pValueBtn.classList.add('active');
        } else {
          pValueBtn.classList.remove('active');
        }
      }
      
      // Internal state
      if(state.shiftUnits !== undefined) shiftUnits = state.shiftUnits;
      if(state.shiftUnits2 !== undefined) shiftUnits2 = state.shiftUnits2;
      if(state.shiftUnits3 !== undefined) shiftUnits3 = state.shiftUnits3;
      if(state.currentN !== undefined) currentN = state.currentN;
      if(state.isLockedToBeta !== undefined) isLockedToBeta = state.isLockedToBeta;
      if(state.domainOffset !== undefined) domainOffset = state.domainOffset;
      if(state.fixedDomain !== undefined) fixedDomain = state.fixedDomain;
      if(state.data !== undefined) data = [...state.data];
      if(state.data2 !== undefined) data2 = [...state.data2];
      if(state.data3 !== undefined) data3 = [...state.data3];
      if(state.blueMarks !== undefined) {
        blueMarks = state.blueMarks.map(m => ({...m}));
        if(blueMarks.length > 0) {
          nextMarkId = Math.max(...blueMarks.map(m => m.id)) + 1;
        }
      }
      if(state.vertLinesAttachment !== undefined) vertLinesAttachment = state.vertLinesAttachment;
      if(state.vertLineDistFromB !== undefined) vertLineDistFromB = {...state.vertLineDistFromB};
      if(state.linkedMarks !== undefined) linkedMarks = {...state.linkedMarks};
      if(state.previousSE !== undefined) previousSE = state.previousSE;
      
      updateSimulateButtonText();
      draw();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          rescale();
        });
      });
    },

    isAttached: function () {
      const internalSvg =
        svg.node();

      const internalCurve =
        curvePath.node();

      const visibleSvg =
        document.querySelector(
          '#chart svg'
        );

      const visibleCurve =
        document.querySelector(
          '#chart .curve'
        );

      return Boolean(
        internalSvg
        && internalCurve
        && internalSvg.isConnected
        && internalCurve.isConnected
        && internalSvg === visibleSvg
        && internalCurve === visibleCurve
      );
    },

    // Register event listener for recording
    onAction: function(callback) {
      tutorialEventListeners.push(callback);
    },
    
    // Remove event listener
    offAction: function(callback) {
      const index = tutorialEventListeners.indexOf(callback);
      if(index > -1) {
        tutorialEventListeners.splice(index, 1);
      }
    }
  };
})();