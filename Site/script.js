const lowercase = "abcdefghijklmnopqrstuvwxyz";
const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()-_=+[]{};:,.<>?/~`";
const similarChars = "0Ol1I";

let passwordHistory = [];

document.getElementById("lengthSlider").addEventListener("input", function () {
  document.getElementById("lengthDisplay").textContent = this.value;
  updateStrengthMeter();
});

document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener("change", updateStrengthMeter);
});

function setPreset(type) {
  const checkboxes = {
    lowercase: document.getElementById("lowercase"),
    uppercase: document.getElementById("uppercase"),
    numbers: document.getElementById("numbers"),
    symbols: document.getElementById("symbols"),
    excludeSimilar: document.getElementById("excludeSimilar"),
  };

  Object.values(checkboxes).forEach((cb) => (cb.checked = false));

  switch (type) {
    case "basic":
      checkboxes.lowercase.checked = true;
      checkboxes.uppercase.checked = true;
      document.getElementById("lengthSlider").value = 8;
      break;
    case "strong":
      checkboxes.lowercase.checked = true;
      checkboxes.uppercase.checked = true;
      checkboxes.numbers.checked = true;
      document.getElementById("lengthSlider").value = 12;
      break;
    case "ultra":
      checkboxes.lowercase.checked = true;
      checkboxes.uppercase.checked = true;
      checkboxes.numbers.checked = true;
      checkboxes.symbols.checked = true;
      document.getElementById("lengthSlider").value = 16;
      break;
    case "memorable":
      checkboxes.lowercase.checked = true;
      checkboxes.uppercase.checked = true;
      checkboxes.numbers.checked = true;
      checkboxes.excludeSimilar.checked = true;
      document.getElementById("lengthSlider").value = 10;
      break;
  }

  document.getElementById("lengthDisplay").textContent =
    document.getElementById("lengthSlider").value;
  updateStrengthMeter();
}

function generatePassword() {
  const length = parseInt(document.getElementById("lengthSlider").value);
  const useLower = document.getElementById("lowercase").checked;
  const useUpper = document.getElementById("uppercase").checked;
  const useNumbers = document.getElementById("numbers").checked;
  const useSymbols = document.getElementById("symbols").checked;
  const excludeSimilar = document.getElementById("excludeSimilar").checked;

  let allChars = "";
  if (useLower) allChars += lowercase;
  if (useUpper) allChars += uppercase;
  if (useNumbers) allChars += numbers;
  if (useSymbols) allChars += symbols;

  if (allChars === "") {
    alert("Please select at least one character type!");
    return;
  }
  if (excludeSimilar) {
    for (let char of similarChars) {
      allChars = allChars.replace(
        new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ""
      );
    }
  }

  let password = "";
  const requiredChars = [];
  if (useLower)
    requiredChars.push(
      getRandomChar(excludeSimilar ? lowercase.replace(/[ol]/g, "") : lowercase)
    );
  if (useUpper)
    requiredChars.push(
      getRandomChar(excludeSimilar ? uppercase.replace(/[OI]/g, "") : uppercase)
    );
  if (useNumbers)
    requiredChars.push(
      getRandomChar(excludeSimilar ? numbers.replace(/[01]/g, "") : numbers)
    );
  if (useSymbols) requiredChars.push(getRandomChar(symbols));

  for (let i = 0; i < length; i++) {
    if (i < requiredChars.length) {
      password += requiredChars[i];
    } else {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
  }

  password = shuffleString(password);

  document.getElementById("passwordText").textContent = password;
  document.getElementById("copyBtn").style.display = "inline-block";

  addToHistory(password);
  updateStrengthMeter();
}

function getRandomChar(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function shuffleString(str) {
  return str
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function copyPassword() {
  const passwordText = document.getElementById("passwordText").textContent;
  navigator.clipboard.writeText(passwordText).then(() => {
    const copyBtn = document.getElementById("copyBtn");
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove("copied");
    }, 2000);
  });
}

function addToHistory(password) {
  const timestamp = new Date().toLocaleTimeString();
  passwordHistory.unshift({ password, timestamp });

  if (passwordHistory.length > 10) {
    passwordHistory = passwordHistory.slice(0, 10);
  }

  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const historyDiv = document.getElementById("passwordHistory");

  if (passwordHistory.length === 0) {
    historyDiv.innerHTML =
      '<div style="text-align: center; color: #666; font-style: italic;">No passwords generated yet</div>';
    return;
  }

  historyDiv.innerHTML = passwordHistory
    .map(
      (item) => `
                <div class="history-item">
                    <span>${item.password}</span>
                    <span style="font-size: 12px; color: #666;">${item.timestamp}</span>
                </div>
            `
    )
    .join("");
}

function clearHistory() {
  passwordHistory = [];
  updateHistoryDisplay();
}

function updateStrengthMeter() {
  const length = parseInt(document.getElementById("lengthSlider").value);
  const useLower = document.getElementById("lowercase").checked;
  const useUpper = document.getElementById("uppercase").checked;
  const useNumbers = document.getElementById("numbers").checked;
  const useSymbols = document.getElementById("symbols").checked;

  let score = 0;
  let charSetSize = 0;

  if (useLower) charSetSize += 26;
  if (useUpper) charSetSize += 26;
  if (useNumbers) charSetSize += 10;
  if (useSymbols) charSetSize += 30;

  if (charSetSize > 0) {
    const entropy = length * Math.log2(charSetSize);
    score = Math.min(100, (entropy / 60) * 100); // Scale to 100
  }

  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");

  let color, text;
  if (score < 25) {
    color = "#dc3545";
    text = "Very Weak";
  } else if (score < 50) {
    color = "#fd7e14";
    text = "Weak";
  } else if (score < 75) {
    color = "#ffc107";
    text = "Medium";
  } else if (score < 90) {
    color = "#28a745";
    text = "Strong";
  } else {
    color = "#20c997";
    text = "Very Strong";
  }

  strengthFill.style.width = score + "%";
  strengthFill.style.background = color;
  strengthText.textContent = text;
  strengthText.style.color = color;
}

updateStrengthMeter();
