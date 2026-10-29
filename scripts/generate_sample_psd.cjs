const fs = require('fs');
const path = require('path');
const { writePsdBuffer } = require('ag-psd');

// Create a valid multi-layer PSD file
const width = 800;
const height = 600;

// Create raw RGBA buffers
function createSolidBuffer(w, h, r, g, b, a = 255) {
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  }
  return buf;
}

const psd = {
  width,
  height,
  children: [
    {
      name: 'Background Fill',
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      opacity: 1,
      blendMode: 'normal'
    },
    {
      name: 'Accent Panel (Multiply)',
      left: 100,
      top: 100,
      right: 700,
      bottom: 500,
      opacity: 0.85,
      blendMode: 'multiply'
    },
    {
      name: 'Title Text Layer',
      left: 150,
      top: 220,
      right: 650,
      bottom: 300,
      opacity: 1,
      blendMode: 'normal',
      text: {
        text: 'Photoshop PSD Layered Import Test',
        style: {
          fontSize: 36,
          fillColor: { r: 255, g: 255, b: 255 }
        }
      }
    }
  ]
};

const buffer = writePsdBuffer(psd);
const outPath = path.join(__dirname, '..', 'sample-photoshop.psd');
fs.writeFileSync(outPath, buffer);
console.log('Successfully generated test PSD:', outPath, 'Bytes:', buffer.length);
