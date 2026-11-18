# Special Birthday Delivery (Philippines 🇵🇭 ➔ United Kingdom 🇬🇧)

An interactive, animated pastel birthday greeting built for **GitHub Pages** (Desktop & Mobile).

## ✨ Experience Flow
1. **World Map & Paper Airplane Flight**: Opens with a stylized pastel world map where an origami paper airplane takes off from the **Philippines** and glides along a curved dashed path to the **United Kingdom**.
2. **Envelope Arrival**: Upon landing in the UK, the map gently blurs into the background as a 3D airmail envelope pops up with a pulsing *"Click to open"* prompt.
3. **Video Frame Emergence**: Clicking or tapping the envelope unfolds the top wax-sealed flap and slides out a polaroid video frame that automatically plays the birthday video.
4. **Folding Frame & Birthday Letter Reveal**: Once the video finishes (or if *"Open Letter 💌"* is clicked):
   - **Desktop**: The video frame smoothly folds to the left side while a handwritten birthday letter slides out of the envelope beside it.
   - **Mobile**: The video frame folds neatly to the top and the birthday letter slides out directly below it so both remain completely visible.
   - A pastel confetti burst and musical birthday chime celebrate the reveal!
5. **Start Over**: A *"Start Over"* button appears at the bottom to replay the entire journey from the beginning.

---

## 🎬 Your Birthday Video (`Video.mp4`)

Your `Video.mp4` file (~73 MB) is already detected and linked in [`index.html`](./index.html) and [`script.js`](./script.js)!
- Because GitHub Pages runs on case-sensitive Linux servers, both `Video.mp4` and `video.mp4` are configured as video sources so it plays seamlessly on both Windows and GitHub Pages.
- Since `Video.mp4` is ~73 MB (under GitHub's 100 MB file size limit), it can be committed and pushed directly to your GitHub Pages repository.

---

## 💌 How to Customize the Birthday Message

Open [`script.js`](./script.js) and edit the `BIRTHDAY_CONFIG` object at the very top of the file:

```javascript
const BIRTHDAY_CONFIG = {
  videoSrc: 'video.mp4',
  flightDurationMs: 4200,

  letterHeading: 'Happy Birthday to you!',
  recipientSalutation: 'Dearest Birthday Star,',
  messageParagraphs: [
    'Across the oceans and thousands of miles from the Philippines all the way to the United Kingdom, this little paper airplane brings you the warmest birthday hugs and brightest wishes!',
    'May your year ahead be filled with sweet surprises, cozy moments, endless laughter, and dreams coming true. Have the most magical celebration today!'
  ],
  signoffText: 'With love from the Philippines,',
  senderSignature: 'Your Loved Ones 💝'
};
```

---

## 🚀 Deploying to GitHub Pages

1. Push all files (`index.html`, `style.css`, `script.js`, `video.mp4`, `README.md`) to a GitHub repository.
2. Go to your repository on GitHub ➔ **Settings** ➔ **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch** and choose your `main` (or `master`) branch and `/ (root)` folder, then click **Save**.
4. Your animated birthday card will be live at `https://<your-username>.github.io/<repo-name>/`!
