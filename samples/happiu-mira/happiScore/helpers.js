function circumferenceState() {
  return 130 * Math.PI;
}

function halfCircumferenceState() {
  return circumferenceState() / 2;
}

function getOffset(data) {
  return circumferenceState() - (data / 200) * circumferenceState();
}

function getNeedleRotate(score) {
  return -90 + (score * 180) / 100;
}

function getHappiUColor(score) {
  if (Number(score) < 50) {
    return "rgb(255, 23, 33)";
  } else if (Number(score) > 75) {
    return "rgb(0, 201, 135)";
  }

  return "rgb(254, 198, 45)";
};