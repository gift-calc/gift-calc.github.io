// Gift Calculator Interactive Controls
// Parameter sliders and visual controls for the gift calculator demo

class GiftCalcControls {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      onUpdate: () => {},
      showCommandBuilder: true,
      showVisualBias: true,
      ...options
    };
    
    this.state = {
      baseValue: 70,
      variation: 20,
      friendScore: 5,
      niceScore: 5,
      currency: 'SEK',
      decimals: 2,
      recipientName: '',
      useMaximum: false,
      useMinimum: false
    };
    
    this.init();
  }
  
  init() {
    this.createControlsStructure();
    this.bindEvents();
    this.updateDisplay();
  }
  
  createControlsStructure() {
    this.container.innerHTML = `
      <div class="controls-panel">
        <div class="controls-header">
          <h3>🎁 Interactive Parameters</h3>
          <p>Adjust values to see how they affect gift calculations</p>
        </div>
        
        <div class="control-group">
          <label class="control-label">
            Base Value: <span class="control-value" id="base-value-display">70</span>
            <span class="currency-display">SEK</span>
          </label>
          <input type="range" id="base-value" class="control-slider" 
                 min="10" max="500" value="70" step="5">
          <div class="control-hint">The starting amount before variation</div>
        </div>
        
        <div class="control-group">
          <label class="control-label">
            Variation: <span class="control-value" id="variation-display">20</span>%
          </label>
          <input type="range" id="variation" class="control-slider" 
                 min="0" max="50" value="20" step="1">
          <div class="control-hint">Random variation range (±%)</div>
        </div>
        
        <div class="control-group">
          <label class="control-label">
            Friend Score: <span class="control-value" id="friend-score-display">5</span>/10
            <span class="bias-indicator" id="friend-bias"></span>
          </label>
          <input type="range" id="friend-score" class="control-slider" 
                 min="1" max="10" value="5" step="0.5">
          <div class="control-hint">1-3: Lower bias | 4-6: Neutral | 7-10: Higher bias</div>
        </div>
        
        <div class="control-group">
          <label class="control-label">
            Nice Score: <span class="control-value" id="nice-score-display">5</span>/10
            <span class="bias-indicator" id="nice-bias"></span>
          </label>
          <input type="range" id="nice-score" class="control-slider" 
                 min="0" max="10" value="5" step="0.5">
          <div class="control-hint">0: No gift | 1-3: Fixed reduction | 4-10: Bias amount</div>
        </div>
        
        <div class="control-row">
          <div class="control-group control-small">
            <label class="control-label">Currency</label>
            <select id="currency" class="control-select">
              <option value="SEK">SEK</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="NOK">NOK</option>
              <option value="DKK">DKK</option>
            </select>
          </div>
          
          <div class="control-group control-small">
            <label class="control-label">Decimals</label>
            <select id="decimals" class="control-select">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2" selected>2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
        
        <div class="control-group">
          <label class="control-label">Recipient Name (optional)</label>
          <input type="text" id="recipient-name" class="control-input" 
                 placeholder="Enter name..." maxlength="50">
        </div>
        
        <div class="control-group">
          <div class="checkbox-row">
            <label class="checkbox-label">
              <input type="radio" name="amount-mode" value="normal" checked>
              Normal calculation
            </label>
            <label class="checkbox-label">
              <input type="radio" name="amount-mode" value="max">
              Force maximum (+20%)
            </label>
            <label class="checkbox-label">
              <input type="radio" name="amount-mode" value="min">
              Force minimum (-20%)
            </label>
          </div>
        </div>
        
        <div class="calculation-preview">
          <div class="preview-header">
            <h4>💡 Live Preview</h4>
            <button class="recalculate-btn" id="recalculate">🎲 Recalculate</button>
          </div>
          <div class="preview-result" id="preview-result">
            <span class="result-amount">70.00 SEK</span>
            <span class="result-name"></span>
          </div>
          <div class="preview-explanation" id="preview-explanation">
            Base calculation with neutral bias
          </div>
        </div>
        
        <div class="command-builder" id="command-builder">
          <div class="command-header">
            <h4>📋 Generated Command</h4>
            <button class="copy-command-btn" id="copy-command">Copy</button>
          </div>
          <div class="command-text" id="command-text">gift-calc</div>
          <button class="run-command-btn" id="run-command">Run in Terminal</button>
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    // Slider events
    const sliders = ['base-value', 'variation', 'friend-score', 'nice-score'];
    sliders.forEach(id => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener('input', () => this.updateFromSlider(id));
      }
    });
    
    // Select events
    document.getElementById('currency').addEventListener('change', () => this.updateFromSelect('currency'));
    document.getElementById('decimals').addEventListener('change', () => this.updateFromSelect('decimals'));
    
    // Text input events
    document.getElementById('recipient-name').addEventListener('input', () => this.updateFromInput('recipient-name'));
    
    // Radio button events
    const radioButtons = document.querySelectorAll('input[name="amount-mode"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => this.updateFromRadio());
    });
    
    // Button events
    document.getElementById('recalculate').addEventListener('click', () => this.recalculate());
    document.getElementById('copy-command').addEventListener('click', () => this.copyCommand());
    document.getElementById('run-command').addEventListener('click', () => this.runInTerminal());
  }
  
  updateFromSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    const value = parseFloat(slider.value);
    
    switch (sliderId) {
      case 'base-value':
        this.state.baseValue = value;
        break;
      case 'variation':
        this.state.variation = value;
        break;
      case 'friend-score':
        this.state.friendScore = value;
        break;
      case 'nice-score':
        this.state.niceScore = value;
        break;
    }
    
    this.updateDisplay();
  }
  
  updateFromSelect(selectId) {
    const select = document.getElementById(selectId);
    const value = select.value;
    
    switch (selectId) {
      case 'currency':
        this.state.currency = value;
        break;
      case 'decimals':
        this.state.decimals = parseInt(value);
        break;
    }
    
    this.updateDisplay();
  }
  
  updateFromInput(inputId) {
    const input = document.getElementById(inputId);
    const value = input.value;
    
    switch (inputId) {
      case 'recipient-name':
        this.state.recipientName = value;
        break;
    }
    
    this.updateDisplay();
  }
  
  updateFromRadio() {
    const checkedRadio = document.querySelector('input[name="amount-mode"]:checked');
    const value = checkedRadio.value;
    
    this.state.useMaximum = value === 'max';
    this.state.useMinimum = value === 'min';
    
    this.updateDisplay();
  }
  
  updateDisplay() {
    this.updateSliderDisplays();
    this.updateBiasIndicators();
    this.updatePreview();
    this.updateCommandBuilder();
    
    // Call external update callback
    this.options.onUpdate(this.state);
  }
  
  updateSliderDisplays() {
    document.getElementById('base-value-display').textContent = this.state.baseValue;
    document.getElementById('variation-display').textContent = this.state.variation;
    document.getElementById('friend-score-display').textContent = this.state.friendScore;
    document.getElementById('nice-score-display').textContent = this.state.niceScore;
    document.querySelector('.currency-display').textContent = this.state.currency;
  }
  
  updateBiasIndicators() {
    const friendBias = this.getBiasLevel(this.state.friendScore);
    const niceBias = this.getBiasLevel(this.state.niceScore, true);
    
    document.getElementById('friend-bias').textContent = friendBias.text;
    document.getElementById('friend-bias').className = `bias-indicator ${friendBias.class}`;
    
    document.getElementById('nice-bias').textContent = niceBias.text;
    document.getElementById('nice-bias').className = `bias-indicator ${niceBias.class}`;
  }
  
  getBiasLevel(score, isNiceScore = false) {
    if (isNiceScore && score === 0) {
      return { text: '🚫 No Gift', class: 'bias-none' };
    }
    
    if (isNiceScore && score <= 3) {
      const reductions = { 1: '90%', 2: '80%', 3: '70%' };
      return { text: `📉 -${reductions[score]}`, class: 'bias-negative' };
    }
    
    if (score < 4) {
      return { text: '📉 Lower', class: 'bias-negative' };
    } else if (score <= 6) {
      return { text: '⚖️ Neutral', class: 'bias-neutral' };
    } else if (score <= 8) {
      return { text: '📈 Higher', class: 'bias-positive' };
    } else {
      return { text: '🚀 Much Higher', class: 'bias-very-positive' };
    }
  }
  
  updatePreview() {
    try {
      const amount = window.GiftCalc.calculateFinalAmount(
        this.state.baseValue,
        this.state.variation,
        this.state.friendScore,
        this.state.niceScore,
        this.state.decimals,
        this.state.useMaximum,
        this.state.useMinimum
      );
      
      const output = window.GiftCalc.formatOutput(amount, this.state.currency, this.state.recipientName);
      
      document.getElementById('preview-result').innerHTML = `
        <span class="result-amount">${amount} ${this.state.currency}</span>
        ${this.state.recipientName ? `<span class="result-name">for ${this.state.recipientName}</span>` : ''}
      `;
      
      document.getElementById('preview-explanation').textContent = this.getExplanation();
      
    } catch (error) {
      document.getElementById('preview-result').innerHTML = `<span class="result-error">Error: ${error.message}</span>`;
      document.getElementById('preview-explanation').textContent = '';
    }
  }
  
  getExplanation() {
    if (this.state.niceScore === 0) {
      return 'No gift for assholes! 🚫';
    }
    
    if (this.state.niceScore <= 3) {
      const percentages = { 1: '10%', 2: '20%', 3: '30%' };
      return `Fixed at ${percentages[this.state.niceScore]} of base value due to low nice score`;
    }
    
    if (this.state.useMaximum) {
      return `Maximum amount: base value + 20%`;
    }
    
    if (this.state.useMinimum) {
      return `Minimum amount: base value - 20%`;
    }
    
    const friendLevel = this.state.friendScore < 4 ? 'lower' : 
                       this.state.friendScore <= 6 ? 'neutral' : 'higher';
    const niceLevel = this.state.niceScore <= 6 ? 'neutral' : 'higher';
    
    return `Random calculation with ${friendLevel} friend bias and ${niceLevel} nice bias`;
  }
  
  updateCommandBuilder() {
    let command = 'gift-calc';
    
    if (this.state.baseValue !== 70) {
      command += ` -b ${this.state.baseValue}`;
    }
    
    if (this.state.variation !== 20) {
      command += ` -r ${this.state.variation}`;
    }
    
    if (this.state.friendScore !== 5) {
      command += ` -f ${this.state.friendScore}`;
    }
    
    if (this.state.niceScore !== 5) {
      command += ` -n ${this.state.niceScore}`;
    }
    
    if (this.state.currency !== 'SEK') {
      command += ` -c ${this.state.currency}`;
    }
    
    if (this.state.decimals !== 2) {
      command += ` -d ${this.state.decimals}`;
    }
    
    if (this.state.recipientName) {
      command += ` --name "${this.state.recipientName}"`;
    }
    
    if (this.state.useMaximum) {
      command += ` --max`;
    }
    
    if (this.state.useMinimum) {
      command += ` --min`;
    }
    
    document.getElementById('command-text').textContent = command;
  }
  
  recalculate() {
    this.updatePreview();
    
    // Add visual feedback
    const button = document.getElementById('recalculate');
    const originalText = button.textContent;
    button.textContent = '✨ Calculating...';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 500);
  }
  
  copyCommand() {
    const command = document.getElementById('command-text').textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(command).then(() => {
        this.showCopyFeedback('copy-command');
      }).catch(() => {
        this.fallbackCopy(command);
      });
    } else {
      this.fallbackCopy(command);
    }
  }
  
  fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopyFeedback('copy-command');
    } catch (err) {
      console.error('Could not copy to clipboard:', err);
    }
    
    textArea.remove();
  }
  
  showCopyFeedback(buttonId) {
    const button = document.getElementById(buttonId);
    const originalText = button.textContent;
    button.textContent = '✅ Copied!';
    
    setTimeout(() => {
      button.textContent = originalText;
    }, 1500);
  }
  
  runInTerminal() {
    const command = document.getElementById('command-text').textContent;
    
    // Try to execute in the terminal if it exists
    if (window.giftCalcTerminal) {
      window.giftCalcTerminal.executeCommandString(command);
      
      // Scroll to terminal
      const terminalElement = document.getElementById('gift-calc-terminal');
      if (terminalElement) {
        terminalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  
  // Public API
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateSliders();
    this.updateDisplay();
  }
  
  updateSliders() {
    document.getElementById('base-value').value = this.state.baseValue;
    document.getElementById('variation').value = this.state.variation;
    document.getElementById('friend-score').value = this.state.friendScore;
    document.getElementById('nice-score').value = this.state.niceScore;
    document.getElementById('currency').value = this.state.currency;
    document.getElementById('decimals').value = this.state.decimals;
    document.getElementById('recipient-name').value = this.state.recipientName;
    
    const mode = this.state.useMaximum ? 'max' : this.state.useMinimum ? 'min' : 'normal';
    document.querySelector(`input[name="amount-mode"][value="${mode}"]`).checked = true;
  }
  
  getState() {
    return { ...this.state };
  }
}

// Initialize controls when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const controlsContainer = document.getElementById('gift-calc-controls');
  if (controlsContainer) {
    window.giftCalcControls = new GiftCalcControls('gift-calc-controls', {
      onUpdate: (state) => {
        // Optional: sync with other components
        console.log('State updated:', state);
      }
    });
  }
});