# AI Presentation Generator

An AI-powered presentation generator that converts text ideas into structured and visually designed presentation slides.

This project is a customized version of an open-source presentation generation system, modified to support local AI-based presentation generation using Ollama and local model inference.

## Features

- Generate presentation outlines from text prompts
- Generate complete presentations from structured outlines
- Local AI generation using Ollama
- Support for customizable presentation themes
- Multiple slide layouts
- Presentation preview and editing
- PPTX presentation export
- AI-assisted image generation
- Image generation through Pollinations
- Custom model selection
- Web-based presentation creation interface

## AI Model

This project supports local text generation using:

- Ollama
- Llama 3.2 3B

The local model allows presentation content to be generated without requiring an OpenAI API key.

## Image Generation

The project uses Pollinations for AI-generated presentation images.

An API key is required and should be stored in the `.env` file.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- NextAuth
- LangChain
- Ollama
- Pollinations

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Lakshanika-tech/presentation-ai-gemini-ollama.git
cd presentation-ai-gemini-ollama