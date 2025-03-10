# AI Interview Coach

Simulates a real interview environment by combining body language tracking (eye contact, posture, and hand movements) with an evaluation of answer quality based on audio transcription. It guides the user through the interview process and provides a final evaluation.

## Demo

[![AI Interview Coach Demo](https://img.youtube.com/vi/GokPYYGrF5g/0.jpg)](https://www.youtube.com/watch?v=GokPYYGrF5g)

## Technologies Used

- **Next.js** 
- **Screenpipe** 
- **OpenAI** 
- **MediaPipe**

## Features

- **Real-Time Interaction:** Captures and processes user audio with Screenpipe and OpenAI, enabling a dynamic conversation simulation.
- **Body Language Analysis:** Monitors eye movement, hand gestures, and posture using MediaPipe to provide detailed feedback on body language.
- **Performance Metrics:** Generates comprehensive reports highlighting strengths and areas for improvement, helping users refine their interview techniques.
- **Immersive Interview Simulation:** Creates a realistic, interactive environment that mimics live interview scenarios, perfect for job seekers and professionals looking to enhance their presentation skills.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- A Screenpipe API key (if required)
- Access credentials for OpenAI services
- A working installation of MediaPipe (refer to the [MediaPipe documentation](https://google.github.io/mediapipe/) for setup instructions)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/AI-Interview-Coach.git
   ```
2. **Install dependencies:**
    ```bash
    bun install
    ```
3. **Configure environment variables: Create a .env file in the root directory and add your API keys and configuration settings:**
    ```bash
    OPENAI_API_KEY=your_api_key_here
    ```
4. **Run Development Server:**
    ```bash
    npm run dev
    ```
Open http://localhost:3000 in your browser to view the application.
