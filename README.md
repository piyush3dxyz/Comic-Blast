# 💥 Comic Blast! 💥

## Turn Your Imagination Into a Comic Book — Instantly!

**Comic Blast!** is a web application that uses the power of generative AI to transform your stories into vibrant, ready-to-read comic books. Just write your story, choose a layout, and watch as the AI brings your words to life with unique illustrations and dialogue, all presented in a fun, high-energy, comic-themed interface.

---

### ✨ Features

-   **AI Story-to-Comic Generation**: Leverages advanced generative AI to interpret your story and create corresponding comic panels.
-   **Dynamic Image Generation**: Creates unique, comic-style illustrations for every panel based on your narrative.
-   **Themed UI/UX**: A fun, immersive interface with comic-book fonts, colors, and animations that makes creating feel like playing.
-   **Visual Panel Layout Selector**: Choose your comic's structure with an intuitive, clickable layout selector instead of a boring dropdown menu.
-   **Styled Speech Bubbles**: Dialogue and narration are automatically placed in classic comic book speech bubbles over the artwork.
-   **PDF Export**: Download your finished comic as a high-quality PDF, perfect for sharing or printing.
-   **Engaging Loading State**: Never get bored waiting! The app displays classic comic action words like "POW!" and "BAM!" while your comic generates.

### 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (React)
-   **Generative AI**: [Google's Gemini](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **Image Generation**: [Replicate](https://replicate.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
-   **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

---

### 🚀 Getting Started

To run this project locally, follow these steps:

#### 1. Prerequisites

-   Node.js (v18 or later)
-   An API key from [Replicate](https://replicate.com/docs/get-started/nodejs).

#### 2. Clone the Repository

```bash
git clone https://github.com/your-username/comic-blast.git
cd comic-blast
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Set Up Environment Variables

Create a file named `.env` in the root of your project and add your Replicate API token:

```
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

#### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).
