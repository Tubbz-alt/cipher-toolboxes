function quadgramScore (text) {
  text = text.toUpperCase().split('').filter(c => alphabet.indexOf(c) > -1).join("");
  var sum = 0;
  for (var i = 0; i < text.length - 3; i++) {
    var score = englishQuadgrams[text.slice(i, i+4)];
    if (score >= 1) {
      sum += score;
    }
  }
  return sum / (text.length - 4);
}

// Source: http://practicalcryptography.com/cryptanalysis/letter-frequencies-various-languages/english-letter-frequencies/
var englishQuadgrams = {
};