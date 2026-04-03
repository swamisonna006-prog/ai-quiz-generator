# AI Smart-Tutor & Quiz Generator

## 💡 Inspiration
Traditional learning often involves staring passively at isolated blocks of text, leading to poor retention and a lack of active engagement. We wanted to construct a tool that goes far beyond merely testing your knowledge. Our goal was to build a system that actively teaches and reinforces concepts in real time as you practice.

## 💻 What it does
Our application transforms any raw text snippet or uploaded document into a highly customized, deeply interactive educational experience. Instead of forcing you into a standard, generic quiz, the user has total freedom to configure the difficulty level, adjust the total number of questions, and narrow down the specific topics they want to aggressively focus on. 

As you proceed through the quiz, the application acts as an intelligent, one-on-one tutor:
- **Real-Time Corrections:** The moment you select an answer, an explanation box illuminates dynamically. It immediately explains exactly why the answer you chose is correct or incorrect, gently rectifying common student misconceptions before you move on.
- **Post-Quiz Analysis:** Even after the final question, the engine meticulously analyzes your overall performance. It intelligently organizes the core concepts you successfully mastered alongside the topics you struggled with, generating short, contextual "Tutor Cards." These serve as a bespoke study guide to help you achieve a perfect score next time.

## ⚙️ How we built it
The frontend was engineered utilizing Vanilla HTML, semantic CSS, and component-based JavaScript to remain completely lightweight. We introduced a modern "glassmorphic" aesthetic with animated mesh gradients and customized native scrollbars, making the educational environment feel premium and immersive. The robust backend intelligence is powered exclusively by the **Google Gemini-Flash API**. By utilizing advanced, tightly-structured prompt engineering and JSON-array parsing, we orchestrate the AI to dynamically assign core curriculum concepts and draft encouraging, student-friendly explanations on the fly.


