import { Text } from 'troika-three-text';
import { COLORS } from '../constants.js';

export class TextRenderer {
  static create({
    text = '',
    fontSize = 0.05,
    color = COLORS.TEXT_PRIMARY,
    anchorX = 'left',
    anchorY = 'top',
    maxWidth = 1.8,
    lineHeight = 1.3,
  } = {}) {
    const troikaText = new Text();
    troikaText.text = text;
    troikaText.fontSize = fontSize;
    troikaText.color = color;
    troikaText.anchorX = anchorX;
    troikaText.anchorY = anchorY;
    troikaText.maxWidth = maxWidth;
    troikaText.lineHeight = lineHeight;
    troikaText.outlineWidth = 0;
    troikaText.sync();
    return troikaText;
  }

  static createTitle(text, width) {
    return TextRenderer.create({
      text,
      fontSize: 0.055,
      color: '#00d4ff',
      anchorX: 'center',
      anchorY: 'middle',
      maxWidth: width - 0.3,
    });
  }

  static createLabel(text) {
    return TextRenderer.create({
      text,
      fontSize: 0.04,
      color: '#9b9bbb',
      anchorX: 'left',
      anchorY: 'top',
    });
  }
}
