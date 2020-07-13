var cipherSpecificFunctions = { // decrypt, generateKey, permuteKey
  "vigenere": [vigenereCrypt, generateAlphaKey, permuteAlphaKey],
  "transposition": [transpositionCrypt, generateOrderKey, permuteOrderKey]
};

var scoreFunctions = {
  "quadgrams": quadgramScore,
  // "letters": letterScore
}


function randRange(min, max) { // largest number that can be returned is max-1
    return Math.floor(Math.random() * (max - min)) + min
}


// Key functions

function generateAlphaKey (keylength) {
  var key = "";
  for (i = 0; i < keylength; i++) {
    key += alphabet[randRange(0, 26)]
  }
  return key;
}

function permuteAlphaKey (key) {
  var toReplace = randRange(0, key.length);
  var replaceWith = randRange(0, 26);
  key = key.split("")
  key[toReplace] = alphabet[replaceWith];
  return key.join("");
}

function generateOrderKey (keylength) {
  function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }
  var items = [];
  for (i = 0; i < keylength; i++) {
    items.push(i);
  }
  return shuffle(items);
}

function permuteOrderKey (key) {
  var keylength = key.length;
  var newKey = [...key];
  // Gets two different locations to swap
  var posA = randRange(0, keylength);
  do {
    var posB = randRange(0, keylength);
  } while (posA == posB);
  var temp = newKey[posA];
  newKey[posA] = newKey[posB];
  newKey[posB] = temp;
  return newKey;
}


function startEvolution () {
  var validated = true;
  var form = document.forms["evolutionForm"];
  var message = form["message"].value;
  if (message == "") {
    validated = false;
    form["message"].classList.add("invalid");
  } else {
    form["message"].classList.remove("invalid");
  }

  // Validates cipher choice and sets cipher specific functions
  var cipher = form.elements["cipher"].value;
  if (cipher == "") {
    validated = false;
    document.getElementById("cipherRadio").classList.add("invalid");
  } else {
    var cipherSpecific = cipherSpecificFunctions[cipher];
    document.getElementById("cipherRadio").classList.remove("invalid");
  }

  var keylength = form["keylength"].value;

  // Sets score/fitness function
  var fitnessName = form.elements["fitnessFunction"].value
  if (fitnessName == "") {
    validated = false;
    document.getElementById("fitnessFunctionRadio").classList.add("invalid");
  } else {
    var fitnessFunction = scoreFunctions[fitnessName];
    document.getElementById("fitnessFunctionRadio").classList.remove("invalid");
  }

  var populationSize = form["populationSize"].value;
  var birthRate = form["birthRate"].value;
  var randomPerGeneration = form["randomPerGeneration"].value;
  var generationLimit = form["generationLimit"].value;

  if (!validated) {
    return;
  }

  document.getElementById("startEvolutionButton").setAttribute("disabled", "true");
  document.getElementById("stopEvolutionButton").removeAttribute("disabled");

  // Runs on completion of each generation
  function eachGen (results) {
    var genNum = results["value"][0];
    // Fills in the results every [fillAfter] generations
    var fillAfter = 1;
    if (genNum % fillAfter == 0) {
      document.getElementById("genNum").innerHTML = genNum;
      var now = new Date;
      var timePassed = (now.getTime() - startTime);
      document.getElementById("timePassed").innerHTML = timePassed + "ms";
      var location = document.getElementById("evolutionResult")
      location.innerHTML = ""; // Clears previous results
      var keysFound = results["value"][1].reverse().slice(0, 10);

      var bestKey = keysFound[0][1];
      // Works out if a better key has been found this generation
      // betterKeyFound is always true in first generation
      var betterKeyFound = !genNum;
      if (genNum) {
        if (typeof(bestKey) == "string") {
          var betterKeyFound = !(bestKey == bestKeyInfo[0])
        } else {
          var prev = bestKeyInfo[0];
          for (i = 0; i < bestKey.length; i++) {
            if (bestKey[i] != prev[i]) {
              betterKeyFound = true;
              break;
            }
          }
        }
      }
      if (betterKeyFound) {
        bestKeyInfo = [bestKey, genNum, timePassed];
        document.getElementById("bestDecryption").innerHTML = cipherSpecific[0](message, bestKey);
        document.getElementById("bestKey").innerHTML = bestKeyInfo[0];
        document.getElementById("bestKeyGenFound").innerHTML = bestKeyInfo[1];
        document.getElementById("bestKeyTimeFound").innerHTML = bestKeyInfo[2] + "ms";
      }

      for (var result of keysFound) {
        var key = result[1];
        var node = document.createElement("LI"); // Create a <li> node
        node.appendChild(document.createTextNode(key + ": " + padAfter(Math.round(result[0]), 8))); // Append the text to <li>
        location.appendChild(node); // Append <li> to <ul> with id="freqResult"
      }
    };
    if (results["done"]) {
      document.getElementById("startEvolutionButton").removeAttribute("disabled");
      document.getElementById("stopEvolutionButton").setAttribute("disabled", "true");
    }
  }

  var now = new Date;
  var startTime = now.getTime();

  var bestKeyInfo = []; // Key, generation found, time found

  evolutionAlgorithm(eachGen, message, ...cipherSpecific, fitnessFunction, keylength, populationSize, birthRate, randomPerGeneration, generationLimit);
}

function stopEvolution () {
  evolutionRunning = false;
  document.getElementById("startEvolutionButton").removeAttribute("disabled");
  document.getElementById("stopEvolutionButton").setAttribute("disabled", "true");
}

// Runs on page load
document.addEventListener("DOMContentLoaded", function (event) {
  dataText = [
    ["title", "Toolbox A3: Evolutionary Algorithm"],
    ["subtitle", "Simulates natural selection to solve ciphers"]
  ]

  startTextAnimation(0);
  setupExpandInfo();
})