# 🎨 PixelPair

### Offline Visual Product Comparison Engine

**One-line description:**
PixelPair is a fully offline, privacy-first AI-powered visual similarity engine that finds visually similar products directly on the user’s device.

---

# 1️⃣ Problem Statement

## Problem Title

Cloud-Dependent Visual Search in E-Commerce

## Problem Description

Online shopping is driven by visual decision-making. Users often want to find products that *look similar* to an image they like — such as a screenshot, social media post, or competitor product.

However, most existing visual search solutions:

* Upload user images to cloud servers
* Depend on paid APIs
* Require internet connectivity
* Increase operational costs
* Raise privacy concerns

There is currently no lightweight, fully client-side visual comparison engine that works independently without cloud infrastructure.

---

## Target Users

* Online shoppers
* E-commerce platforms
* Retail stores & kiosks
* Fashion & lifestyle brands

---

## Existing Gaps

* Heavy cloud dependency
* Privacy risks from image uploads
* High API and server costs
* No offline capability
* Slow response due to server latency

---

# 2️⃣ Problem Understanding & Approach

## Root Cause Analysis

Visual search requires deep learning models to extract features from images. Traditionally, these models are hosted on servers because of computational requirements.

This leads to:

* Infrastructure dependency
* Increased latency
* Scalability challenges
* Privacy concerns

---

## Solution Strategy

PixelPair eliminates server dependency by:

* Running TensorFlow.js directly in the browser
* Extracting embeddings on-device
* Storing product embeddings locally
* Computing cosine similarity client-side
* Returning ranked results instantly

---

# 3️⃣ Proposed Solution

## Solution Overview

PixelPair is a browser-based AI system that analyzes images locally and finds visually similar products from a stored catalog without making any API calls.

---

## Core Idea

Convert images into numerical embeddings using MobileNet and compare embeddings using cosine similarity to measure visual similarity.

---

## Key Features

* 🖼 Drag-and-drop image upload
* 🧠 On-device ML inference using TensorFlow.js
* 💾 Local embedding storage (IndexedDB)
* 📊 Cosine similarity ranking
* 📈 Similarity confidence scores
* 🔒 Fully offline operation
* 🚫 No external APIs

---

# 4️⃣ System Architecture

## High-Level Flow

User → Frontend → TensorFlow.js Model → Embedding Generator → Local Database (IndexedDB) → Similarity Engine → Ranked Results

Since PixelPair is fully offline, backend processing is replaced with client-side logic.

---

## Architecture Description

1. User uploads an image.
2. Image is resized and normalized.
3. TensorFlow.js (MobileNet) extracts a feature embedding.
4. Stored product embeddings are retrieved from IndexedDB.
5. Cosine similarity is computed.
6. Top matches are ranked and displayed with confidence scores.

---

## Architecture Diagram

(Add system architecture diagram image here)

---

# 5️⃣ Database Design

## ER Diagram

(Add ER diagram image here)

---

## ER Diagram Description

### Entities

**Product**

* product_id
* name
* category
* image_path
* embedding_vector

Each product has one embedding representation stored locally.

Database: IndexedDB (Client-side storage)

---

# 6️⃣ Dataset Selected

## Dataset Name

Custom Product Image Dataset

## Source

Curated sample e-commerce product images

## Data Type

Image data (JPEG/PNG)

## Selection Reason

* Lightweight
* Suitable for offline demo
* Controlled test environment
* Quick embedding generation

---

## Preprocessing Steps

* Resize image to 224x224
* Normalize pixel values
* Extract embedding using MobileNet
* Normalize embedding vector

---

# 7️⃣ Model Selected

## Model Name

MobileNet (TensorFlow.js)

## Selection Reasoning

* Lightweight and fast
* Browser-optimized
* Pretrained on ImageNet
* Suitable for feature extraction

## Alternatives Considered

* ResNet (heavier model)
* EfficientNet (larger size)
* Custom CNN (time constraint)

---

## Evaluation Metrics

* Cosine similarity score
* Top-K ranking accuracy
* Inference latency
* Memory usage

---

# 8️⃣ Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS

## Backend

Not required (fully client-side system)

## ML/AI

* TensorFlow.js
* MobileNet

## Database

* IndexedDB

## Deployment

* Static hosting (Vercel / Netlify / GitHub Pages)

---

# 9️⃣ API Documentation & Testing

PixelPair operates without external APIs.

### Core Internal Functions

**generateEmbedding(image)**
Extracts embedding vector from image.

**cosineSimilarity(vectorA, vectorB)**
Computes similarity score.

**getTopMatches(queryEmbedding)**
Returns ranked similar products.

(Add console test screenshots here)

---

# 🔟 Module-wise Development & Deliverables

## Checkpoint 1: Research & Planning

* Problem analysis
* Architecture design
* Stack finalization

## Checkpoint 2: Storage & Data Modeling

* IndexedDB schema
* Product catalog ingestion

## Checkpoint 3: Frontend Development

* Image upload UI
* Results grid UI
* Ranking component

## Checkpoint 4: Model Integration

* MobileNet loading
* Embedding extraction
* Preprocessing pipeline

## Checkpoint 5: Similarity Engine

* Cosine similarity implementation
* Ranking logic
* Confidence scoring

## Checkpoint 6: Deployment

* Final build
* Live hosting
* Demo preparation

---

# 1️⃣1️⃣ End-to-End Workflow

1. User uploads product image
2. Image is preprocessed
3. Embedding is generated
4. Stored embeddings are retrieved
5. Cosine similarity computed
6. Top 5 similar products displayed

---

# 1️⃣2️⃣ Demo & Video

Live Demo Link:
(Add link)

Demo Video Link:
(Add link)

GitHub Repository:
(Add link)

---

# 1️⃣3️⃣ Hackathon Deliverables Summary

* Fully offline working prototype
* On-device ML inference
* Local embedding storage
* Real-time similarity ranking
* Deployment-ready application

---

# 1️⃣4️⃣ Team Roles & Responsibilities

| Member Name   | Role                    | Responsibilities                     |
| ------------- | ----------------------- | ------------------------------------ |
| Tanishq Gupta | ML & System Architect   | Model integration, similarity engine |
| Member 2      | Frontend Developer      | UI/UX, result visualization          |
| Member 3      | Data & Storage Engineer | Dataset prep, IndexedDB design       |

---

# 1️⃣5️⃣ Future Scope & Scalability

## Short-Term

* Category-aware filtering
* Hybrid similarity (color + embedding)
* Larger catalog

## Long-Term

* Approximate Nearest Neighbor indexing
* Edge device optimization
* AR shopping integration
* Retail kiosk deployment

---

# 1️⃣6️⃣ Known Limitations

* Limited dataset size (demo scale)
* Performance depends on device capability
* No distributed catalog synchronization

---

# 1️⃣7️⃣ Impact

* Reduces server and API costs
* Protects user privacy
* Enables offline intelligent retail
* Improves product discovery experience
* Makes AI accessible on edge devices


